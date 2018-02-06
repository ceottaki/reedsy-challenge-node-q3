import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Observable, Observer } from 'rx';

import { IUser, User } from '../core/user.model';
import { IJwtAuthenticationService } from './jwt-authentication.service.d';
import { LogOnInfo } from './logOnInfo.model';

/**
 * Represents an authentication service that allows users to log on and log off from the application.
 *
 * @export
 * @class JwtAuthenticationService
 * @implements {IJwtAuthenticationService}
 */
export class JwtAuthenticationService implements IJwtAuthenticationService {
    private readonly jwtSecret: string;

    /**
     * Creates an instance of JwtAuthenticationService.
     * @param {string} jwtSecret The JWT secret to be used when encoding JWT tokens.
     * @memberof JwtAuthenticationService
     */
    constructor(jwtSecret: string) {
        this.jwtSecret = jwtSecret;
    }

    /**
     * Logs on a user with the given log on information.
     *
     * @param {LogOnInfo} logOnInfo The log on information for a user.
     * @returns {Observable<string | null>} An observable with the token if successfully authenticated; null otherwise.
     * @memberof JwtAuthenticationService
     */
    public logOn(logOnInfo: LogOnInfo): Observable<string | null> {
        let result: Observable<string | null>;

        if (!logOnInfo.checkValidity()) {
            return Observable.of<string | null>(null);
        }

        result = Observable.fromPromise(
            User.findOne({
                email: logOnInfo.emailAddress
            }).exec()).flatMap((user) => {
                if (!user) {
                    return Observable.of<string | null>(null);
                }

                return user.comparePassword(logOnInfo.password).map((isMatch) => {
                    if (isMatch && user.isEmailConfirmed) {
                        const jti = crypto.randomBytes(32).toString('hex');
                        const token: string = jwt.sign(user.toObject(), this.jwtSecret, {
                            expiresIn: '30m',
                            jwtid: jti
                        });
                        return token;
                    }

                    return null;
                });
            });

        return result;
    }

    /**
     * Logs out a user by adding the given token id to the user's blacklist.
     *
     * @param {IUser} user The user to log out.
     * @param {string} jti The JSON token id to blacklist.
     * @returns {Observable<boolean>} An observable indicating whether the user was logged out successfully.
     * @memberof JwtAuthenticationService
     */
    public logOut(user: IUser, jti: string): Observable<boolean> {
        const result = Observable.create((observer: Observer<boolean>) => {
            user.blacklistedTokens.push(jti);
            user.save().then((savedUser: IUser) => {
                observer.onNext(true);
                observer.onCompleted();
            },
                /* istanbul ignore next */
                (err: any) => {
                    observer.onNext(false);
                    observer.onCompleted();
                });
        });

        return result;
    }
}
