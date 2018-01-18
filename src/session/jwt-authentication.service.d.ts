import { Observable } from 'rx';

import { LogOnInfo } from './logOnInfo.model';

/**
 * Defines properties and methods for an implementation of an authentication service.
 *
 * @export
 * @interface IAuthenticationService
 */
export interface IJwtAuthenticationService {
    /**
     * When implemented it should log on a user with the given log on information.
     *
     * @param {LogOnInfo} logOnInfo The log on information for a user.
     * @returns {Observable<string | null>} An observable with the token if successfully authenticated; null otherwise.
     * @memberof IAuthenticationService
     */
    logOn(logOnInfo: LogOnInfo): Observable<string | null>;
}
