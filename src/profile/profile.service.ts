import { Observable, Observer } from 'rx';

import { IUser, User } from '../core/user.model';
import { ProfileFailureReasons } from './profile-failure-reasons.enum';
import { IProfileService } from './profile.service.d';

/**
 * Represents a profile service.
 *
 * @export
 * @class ProfileService
 * @implements {IProfileService}
 */
export class ProfileService implements IProfileService {
    /**
     * Creates a new user profile with the given user information.
     *
     * @param {IUser} user The user profile to be created.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to create a profile.
     * @memberof ProfileService
     */
    public createNewProfile(user: IUser): Observable<ProfileFailureReasons> {
        const result = Observable.create((observer: Observer<ProfileFailureReasons>) => {
            User.create([user]).then((newUsers: IUser[]) => {
                // The user has been created successfully.
                observer.onNext(ProfileFailureReasons.NONE);
            }, (err: any) => {
                // There has been a problem creating the user.
                if (err && err.code === 11000) {
                    observer.onNext(ProfileFailureReasons.DUPLICATE_EMAIL);
                    return User.findOne({
                        email: user.email
                    }).exec().then((existingUser: IUser | null) => {
                        if (existingUser !== null) {
                            if (existingUser.isDeactivated) {
                                observer.onNext(ProfileFailureReasons.INACTIVE_PROFILE);
                            }

                            if (!existingUser.isEmailConfirmed) {
                                observer.onNext(ProfileFailureReasons.UNCONFIRMED_EMAIL);
                            }
                        }
                    });
                } else if (err && err.name === 'ValidationError') {
                    observer.onNext(ProfileFailureReasons.MISSING_REQUIRED);
                } else {
                    observer.onNext(ProfileFailureReasons.UNKNOWN);
                }
            }).then(() => {
                observer.onCompleted();
            });
        });

        return result;
    }

    /**
     * Updates an existing user profile with the given profile.
     *
     * @param {IUser} user The user profile to be updated.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to update a profile.
     * @memberof ProfileService
     */
    public updateProfile(user: IUser): Observable<ProfileFailureReasons> {
        throw new Error('Method not implemented.');
    }

    /**
     * Deactivates the given existing user profile.
     *
     * @param {IUser} user The user profile to be deactivated.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to deactive a profile.
     * @memberof ProfileService
     */
    public deactivateProfile(user: IUser): Observable<ProfileFailureReasons> {
        throw new Error('Method not implemented.');
    }

    /**
     * Cleans a given profile for presentation to client-side, removing the encrypted password, the blacklisted tokens
     * and the e-mail confirmation token.
     *
     * @param {IUser} user The user profile to be cleaned.
     * @returns {object} The cleaned user profile.
     * @memberof ProfileService
     */
    public cleanProfileForClient(user: IUser): any {
        const result: any = user;
        result.password = undefined;
        result.blacklistedTokens = undefined;
        result.emailConfirmationToken = undefined;
        result.__v = undefined;
        return user;
    }
}
