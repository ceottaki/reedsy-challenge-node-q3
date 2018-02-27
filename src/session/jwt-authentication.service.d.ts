import { Observable } from 'rx';

import { IUser } from '../core/user.model';
import { LogOnInfo } from './logOnInfo.model';
import { ILogOnResult } from './logOnResult';

/**
 * Defines properties and methods for an implementation of an authentication service.
 *
 * @export
 * @interface IJwtAuthenticationService
 */
export interface IJwtAuthenticationService {
    /**
     * When implemented it should log on a user with the given log on information.
     *
     * @param {LogOnInfo} logOnInfo The log on information for a user.
     * @returns {Observable<ILogOnResult | null>} An observable with the token if successfully authenticated; null otherwise.
     * @memberof IJwtAuthenticationService
     */
    logOn(logOnInfo: LogOnInfo): Observable<ILogOnResult | null>;

    /**
     * When implemented it should log out a user by adding the given token id to the user's blacklist.
     *
     * @param {IUser} user The user to log out.
     * @param {string} jti The JSON token id to blacklist.
     * @returns {Observable<boolean>} An observable indicating whether the user was logged out successfully.
     * @memberof IJwtAuthenticationService
     */
    logOut(user: IUser, jti: string): Observable<boolean>;
}
