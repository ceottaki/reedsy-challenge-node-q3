import * as mongoose from 'mongoose';
import { Schema, SchemaDefinition, HookNextFunction, Document, Error, Model } from 'mongoose';
import * as crypto from 'crypto';
import { Observable } from 'rx';
import * as fs from 'fs';

// TODO: document.

export interface IUser extends Document {
    email: string;
    password: string;
    fullName: string;
    isEmailConfirmed: boolean;
    emailConfirmationToken?: string;
    createdAt: Date;
    modifiedAt?: Date;
    comparePassword(password: string): Observable<boolean>;
}

export class UserSchema extends Schema {
    constructor() {
        const schemaDefinition: SchemaDefinition = UserSchema.buildSchemaDefinition();
        super(schemaDefinition);
        this.pre('save', this.encryptUserPassword);
        this.pre('save', this.createEmailConfirmationToken);
        this.methods.comparePassword = this.comparePassword;
    }

    private encryptUserPassword(next: HookNextFunction): any {
        const user: IUser = this as any;
        if (user.isModified('password') || user.isNew) {
            crypto.randomBytes(128, function (err: Error, salt: Buffer) {
                if (err) {
                    return next(err);
                }

                crypto.pbkdf2(user.password, salt, 9973, 512, 'sha512', function (err: Error, hash: Buffer) {
                    if (err) {
                        return next(err);
                    }

                    const combined: Buffer = new Buffer(hash.length + salt.length + 8);
                    combined.writeUInt32BE(salt.length, 0, true);
                    combined.writeUInt32BE(9973, 4, true);
                    salt.copy(combined, 8);
                    hash.copy(combined, salt.length + 8);
                    user.password = combined.toString('base64');
                    return next();
                });
            });
        }
        else {
            return next();
        }
    }

    private createEmailConfirmationToken(next: HookNextFunction): any {
        const user: IUser = this as any;
        if (!user.isNew && !user.isModified('email')) {
            return next();
        }

        crypto.randomBytes(32, function (err: Error, salt: Buffer) {
            if (err) {
                return next(err);
            }

            user.isEmailConfirmed = false;
            user.emailConfirmationToken = salt.toString('hex');
            return next();
        });
    }

    private comparePassword(password: string): Observable<boolean> {
        const user: IUser = this as any;
        const combined: Buffer = new Buffer(user.password, 'base64');
        const saltBytes: number = combined.readUInt32BE(0);
        const hashBytes: number = combined.length - saltBytes - 8;
        const iterations: number = combined.readUInt32BE(4);
        const salt: Buffer = combined.slice(8, saltBytes + 8);
        const hash: string = combined.toString('base64', saltBytes + 8);

        const pbkdf2 = Observable.fromNodeCallback<Buffer>(crypto.pbkdf2)
        return pbkdf2(password, salt, iterations, hashBytes, 'sha512').map(verify => {
            if (!verify) {
                return false;
            }

            return verify.toString('base64') === hash;
        });
    }

    private static buildSchemaDefinition(): SchemaDefinition {
        const result: SchemaDefinition = {
            email: {
                type: String,
                unique: true,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            fullName: {
                type: String,
                required: true
            },
            isEmailConfirmed: {
                type: Boolean,
                required: true,
                default: false
            },
            emailConfirmationToken: {
                type: String,
                required: false
            },
            createdAt: {
                type: Date,
                required: true
            },
            modifiedAt: {
                type: Date,
                required: false
            }
        };

        return result;
    }
}

export const User: Model<IUser> = mongoose.model<IUser>('User', new UserSchema());
