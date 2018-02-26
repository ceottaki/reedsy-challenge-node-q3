import * as crypto from 'crypto';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { Document, Error, HookNextFunction, Model, Schema, SchemaDefinition } from 'mongoose';
import { Observable } from 'rx';

/**
 * Defines properties and methods for an implementation of a user.
 *
 * @export
 * @interface IUser
 * @extends {Document}
 */
export interface IUser extends Document {
    /**
     * Gets or sets this user's e-mail address.
     *
     * @type {string}
     * @memberof IUser
     */
    email: string;

    /**
     * Gets or sets this user's password.
     *
     * @type {string}
     * @memberof IUser
     */
    password: string;

    /**
     * Gets or sets this user's full name.
     *
     * @type {string}
     * @memberof IUser
     */
    fullName: string;

    /**
     * Gets or sets this user's nickname.
     *
     * @type {string}
     * @memberof IUser
     */
    nickname?: string;

    /**
     * Gets or sets this user's date of birth.
     *
     * @type {Date}
     * @memberof IUser
     */
    birthday: Date;

    /**
     * Gets or sets a text about this user.
     *
     * @type {string}
     * @memberof IUser
     */
    aboutMe?: string;

    /**
     * Gets or sets the time zone this user operates from.
     *
     * @type {string}
     * @memberof IUser
     */
    timeZone: string;

    /**
     * Gets or sets a value indicating whether this user has had their e-mail address confirmed.
     *
     * @type {boolean}
     * @memberof IUser
     */
    isEmailConfirmed: boolean;

    /**
     * Gets or sets the confirmation token that can be used for this user to confirm their e-mail address.
     *
     * @type {string}
     * @memberof IUser
     */
    emailConfirmationToken?: string;

    /**
     * Gets or sets an array of blacklisted tokens for this user.
     *
     * @type {string[]}
     * @memberof IUser
     */
    blacklistedTokens: string[];

    /**
     * Gets or sets the date in which this user was created.
     *
     * @type {Date}
     * @memberof IUser
     */
    createdAt: Date;

    /**
     * Gets or sets the date in which this user has been last modified.
     *
     * @type {Date}
     * @memberof IUser
     */
    modifiedAt?: Date;

    /**
     * Gets or sets a value indicating whether this user is deactived.
     *
     * @type {boolean}
     * @memberof IUser
     */
    isDeactivated: boolean;

    /**
     * When implemented it should compare this user's password (encrypted) with the given plaintext password.
     *
     * @param {string} password
     * @returns {Observable<boolean>}
     * @memberof IUser
     */
    comparePassword(password: string): Observable<boolean>;
}

/**
 * Represents the Mongoose schema for a user, defining how a user is saved and implementing the functionality
 * of the IUser interface as its definition.
 *
 * @export
 * @class UserSchema
 * @extends {Schema}
 */
export class UserSchema extends Schema {
    /**
     * Creates an instance of UserSchema.
     * @memberof UserSchema
     */
    constructor() {
        const schemaDefinition: SchemaDefinition = UserSchema.buildSchemaDefinition();
        super(schemaDefinition);
        this.pre('save', this.setCreatedModified);
        this.pre('save', this.encryptUserPassword);
        this.pre('save', this.createEmailConfirmationToken);
        this.methods.comparePassword = this.comparePassword;
    }

    /**
     * Builds the schema definition for a user based on the IUser interface.
     *
     * @private
     * @static
     * @returns {SchemaDefinition} The schema definition for a user.
     * @memberof UserSchema
     */
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
            nickname: {
                type: String,
                required: false
            },
            birthday: {
                type: Date,
                required: true
            },
            aboutMe: {
                type: String,
                required: false
            },
            timeZone: {
                type: String,
                required: true,
                default: 'Europe/London'
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
            blacklistedTokens: {
                type: [String],
                required: false
            },
            createdAt: {
                type: Date,
                required: false
            },
            modifiedAt: {
                type: Date,
                required: false
            },
            isDeactivated: {
                type: Boolean,
                required: true,
                default: false
            }
        };

        return result;
    }

    /**
     * Sets the created and modified dates for a user when saving it, to be used as a hook sync function pre-save.
     *
     * @private
     * @param {HookNextFunction} next The next hook function.
     * @returns {*} The result of the next hook function.
     * @memberof UserSchema
     */
    private setCreatedModified(next: HookNextFunction): any {
        const user: IUser = this as any;
        if (user.isNew) {
            user.createdAt = new Date();
            user.blacklistedTokens = new Array<string>();
        } else if (user.isModified('createdAt')) {
            // Changing the created at time and date is not allowed.
            user.unmarkModified('createdAt');
        }

        user.modifiedAt = new Date();
        return next();
    }

    /**
     * Encrypts the user password if the password has been modified in order to only save encrypted passwords,
     * to be used as a hook sync function pre-save.
     *
     * @private
     * @param {HookNextFunction} next The next hook function.
     * @returns {*} The result of the next hook function.
     * @memberof UserSchema
     */
    private encryptUserPassword(next: HookNextFunction): any {
        const user: IUser = this as any;
        if (user.isModified('password') || user.isNew) {
            crypto.randomBytes(128, (err: Error, salt: Buffer) => {
                /* istanbul ignore if */
                if (err) {
                    return next(err);
                }

                crypto.pbkdf2(user.password, salt, 9973, 512, 'sha512', (pbkdf2Error: Error, hash: Buffer) => {
                    /* istanbul ignore if */
                    if (pbkdf2Error) {
                        return next(pbkdf2Error);
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
        } else {
            return next();
        }
    }

    /**
     * Creates an e-mail confirmation token for a user if it is a new user or if the e-mail has been modified,
     * to be used as a hook sync function pre-save.
     *
     * @private
     * @param {HookNextFunction} next The next hook function.
     * @returns {*} The result of the next hook function.
     * @memberof UserSchema
     */
    private createEmailConfirmationToken(next: HookNextFunction): any {
        const user: IUser = this as any;
        if (!user.isNew && !user.isModified('email')) {
            return next();
        }

        crypto.randomBytes(32, (err: Error, salt: Buffer) => {
            /* istanbul ignore if */
            if (err) {
                return next(err);
            }

            user.isEmailConfirmed = false;
            user.emailConfirmationToken = salt.toString('hex');

            // TODO: Call something here that will queue an e-mail to the new e-mail address including a link to confirm it.
            // This will not be added as part of the boilerplate as it is an infrastructure concern and will depend on
            // which environment this API is deployed to.

            // I would recommend that the link is built with both the e-mail address and the confirmation token, perhaps
            // turning the e-mail address into a hex string such as with `new Buffer(user.email, 'utf8').toString('hex');`.
            // A client-side application would then decode the e-mail and call this API's e-mail confirmation endpoint.
            return next();
        });
    }

    /**
     * Compares a given plaintext password to the user's encrypted password, to be used by an implementation of IUser.
     *
     * @private
     * @param {string} password The plaintext password to be compared.
     * @returns {Observable<boolean>} An observable with a value indicating whether the passwords match.
     * @memberof UserSchema
     */
    private comparePassword(password: string): Observable<boolean> {
        const user: IUser = this as any;
        const combined: Buffer = new Buffer(user.password, 'base64');
        const saltBytes: number = combined.readUInt32BE(0);
        const hashBytes: number = combined.length - saltBytes - 8;
        const iterations: number = combined.readUInt32BE(4);
        const salt: Buffer = combined.slice(8, saltBytes + 8);
        const hash: string = combined.toString('base64', saltBytes + 8);

        const pbkdf2 = Observable.fromNodeCallback<Buffer>(crypto.pbkdf2);
        return pbkdf2(password, salt, iterations, hashBytes, 'sha512').map((verify) => {
            /* istanbul ignore if */
            if (!verify) {
                return false;
            }

            return verify.toString('base64') === hash;
        });
    }
}

// Builds the user model with Mongoose using the schema and makes it available as a constant.
export const User: Model<IUser> = mongoose.model<IUser>('User', new UserSchema());
