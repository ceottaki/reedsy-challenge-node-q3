import { Observable } from 'rx';
import * as jwt from 'jsonwebtoken';

import { IJwtAuthenticationService } from './jwt-authentication.service.d';
import { LogOnInfo } from './logOnInfo.model';
import { User, IUser } from './user.model';

/**
 * Represents an authentication service that allows users to log on and log off from the application.
 *
 * @export
 * @class AuthenticationService
 * @implements {IAuthenticationService}
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
     * @returns {Observable<string | null>} An observable with the encoded JWT token if the user was successfully authenticated; null otherwise.
     * @memberof AuthenticationService
     */
    logOn(logOnInfo: LogOnInfo): Observable<string | null> {
        let result: Observable<string | null>;

        result = Observable.fromPromise(
            User.findOne({
                email: logOnInfo.emailAddress
            }).exec()).flatMap(user => {
                if (!user) {
                    return Observable.of<string | null>(null);
                }

                return user.comparePassword(logOnInfo.password).map(isMatch => {
                    if (isMatch && user.isEmailConfirmed) {
                        const token: string = jwt.sign(user.toObject(), this.jwtSecret);
                        return token;
                    }

                    return null;
                });
            });

        return result;
    }
}
