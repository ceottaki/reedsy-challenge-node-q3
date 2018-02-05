import { Observable } from 'rx';

import { IUser } from '../core/user.model';
import { ProfileFailureReasons } from './profile-failure-reasons.enum';

/**
 * Defines properties and methods for an implementation of a profile service.
 *
 * @export
 * @interface IProfileService
 */
export interface IProfileService {
    /**
     * When implemented it should create a new user profile with the given information.
     *
     * @param {IUser} user The user profile to be created.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to create a profile.
     * @memberof IProfileService
     */
    createNewProfile(user: IUser): Observable<ProfileFailureReasons>;

    /**
     * When implemented it should update an existing user profile with the given profile.
     *
     * @param {IUser} user The user profile to be updated.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to update a profile.
     * @memberof IProfileService
     */
    updateProfile(user: IUser): Observable<ProfileFailureReasons>;

    /**
     * When implemented it should deactivate the given existing user profile.
     *
     * @param {IUser} user The user profile to be deactivated.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to deactive a profile.
     * @memberof IProfileService
     */
    deactivateProfile(user: IUser): Observable<ProfileFailureReasons>;

    /**
     * When implemented it should clean a given profile for presentation to client-side,
     * removing sensitive information such as encrypted passwords.
     *
     * @param {IUser} user The user profile to be cleaned.
     * @returns {object} The cleaned user profile.
     * @memberof IProfileService
     */
    cleanProfileForClient(user: IUser): any;
}
