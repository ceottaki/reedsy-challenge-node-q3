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
     * @returns {Observable<ProfileFailureReasons | string>} An observable with reasons for failure to create a profile or its id string.
     * @memberof ProfileService
     */
    public createNewProfile(user: IUser): Observable<ProfileFailureReasons | string> {
        const result = Observable.create((observer: Observer<ProfileFailureReasons | string>) => {
            User.create([user]).then((newUsers: IUser[]) => {
                // The user has been created successfully.
                observer.onNext(ProfileFailureReasons.NONE);
                observer.onNext(newUsers[0].id as string);
            }, (err: any) => {
                // There has been a problem creating the user.
                if (err && err.code === 11000) {
                    observer.onNext(ProfileFailureReasons.DUPLICATE_EMAIL);
                    return User.findOne({
                        email: user.email
                    }).exec().then((existingUser: IUser | null) => {
                        existingUser = existingUser as IUser;
                        if (existingUser.isDeactivated) {
                            observer.onNext(ProfileFailureReasons.INACTIVE_PROFILE);
                        }

                        if (!existingUser.isEmailConfirmed) {
                            observer.onNext(ProfileFailureReasons.UNCONFIRMED_EMAIL);
                        }
                    });
                } else {
                    /* istanbul ignore else */
                    if (err && err.name === 'ValidationError') {
                        observer.onNext(ProfileFailureReasons.MISSING_REQUIRED);
                    } else {
                        /* istanbul ignore next */
                        observer.onNext(ProfileFailureReasons.UNKNOWN);
                    }
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
     * @param {string} profileId The id of the user profile to be updated.
     * @param {*} changes An object with the properties to be changed in a user profile.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to update a profile.
     * @memberof ProfileService
     */
    public updateProfile(profileId: string, changes: any): Observable<ProfileFailureReasons> {
        const result = Observable.create((observer: Observer<ProfileFailureReasons>) => {
            User.findById(profileId, (findError: any, existingUser: IUser | null) => {
                /* istanbul ignore if */
                if (findError) {
                    observer.onError(findError);
                    observer.onNext(ProfileFailureReasons.UNKNOWN);
                    observer.onCompleted();
                    return;
                }

                if (!existingUser) {
                    observer.onNext(ProfileFailureReasons.NON_EXISTENT_PROFILE);
                    observer.onCompleted();
                    return;
                }

                User.schema.eachPath((path: string) => {
                    if (changes.hasOwnProperty(path) && existingUser.get(path) !== changes[path]) {
                        existingUser.set(path, changes[path]);
                    }
                });

                existingUser.save().then((updatedUser: IUser) => {
                    // The user has been updated successfully.
                    observer.onNext(ProfileFailureReasons.NONE);
                }, (err: any) => {
                    // There has been a problem updating the user.
                    if (err && err.code === 11000) {
                        observer.onNext(ProfileFailureReasons.DUPLICATE_EMAIL);
                        return User.findOne({ email: changes.email })
                            .exec().then((conflictingUser: IUser | null) => {
                                conflictingUser = conflictingUser as IUser;
                                if (conflictingUser.isDeactivated) {
                                    observer.onNext(ProfileFailureReasons.INACTIVE_PROFILE);
                                }

                                if (!conflictingUser.isEmailConfirmed) {
                                    observer.onNext(ProfileFailureReasons.UNCONFIRMED_EMAIL);
                                }
                            });
                    } else {
                        /* istanbul ignore else */
                        if (err && err.name === 'ValidationError') {
                            observer.onNext(ProfileFailureReasons.MISSING_REQUIRED);
                        } else {
                            /* istanbul ignore next */
                            observer.onNext(ProfileFailureReasons.UNKNOWN);
                        }
                    }
                }).then(() => {
                    observer.onCompleted();
                });
            });
        });

        return result;
    }

    /**
     * Deactivates the given existing user profile.
     *
     * @param {string} profileId The id of the user profile to be deactivated.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to deactive a profile.
     * @memberof ProfileService
     */
    public deactivateProfile(profileId: string): Observable<ProfileFailureReasons> {
        const result = Observable.create((observer: Observer<ProfileFailureReasons>) => {
            User.findById(profileId, (findError: any, existingUser: IUser | null) => {
                /* istanbul ignore if */
                if (findError) {
                    observer.onError(findError);
                    observer.onNext(ProfileFailureReasons.UNKNOWN);
                    observer.onCompleted();
                    return;
                }

                if (!existingUser) {
                    observer.onNext(ProfileFailureReasons.NON_EXISTENT_PROFILE);
                    observer.onCompleted();
                    return;
                }

                if (existingUser.isDeactivated) {
                    observer.onNext(ProfileFailureReasons.INACTIVE_PROFILE);
                    observer.onCompleted();
                    return;
                }

                existingUser.isDeactivated = true;
                existingUser.save().then((updatedUser: IUser) => {
                    // The user has been de-activated successfully.
                    observer.onNext(ProfileFailureReasons.NONE);
                },
                    /* istanbul ignore next */
                    (err: any) => {
                        // There has been a problem de-activating the user.
                        /* istanbul ignore next */
                        observer.onNext(ProfileFailureReasons.UNKNOWN);
                    }).then(() => {
                        observer.onCompleted();
                    });
            });
        });

        return result;
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

    /**
     * Sets the e-mail confirmed flag of the profile with the given e-mail address to true if the given confirmation
     * token matches the e-mail confirmation token of that profile.
     *
     * @param {string} emailAddress The e-mail address of the profile to be confirmed.
     * @param {string} confirmationToken The confirmation token to match to the profile to be confirmed.
     * @returns {Observable<ProfileFailureReasons>} An observable with possible reasons for failure to confirm the e-mail address.
     * @memberof IProfileService
     */
    public confirmProfileEmailAddress(emailAddress: string, confirmationToken: string): Observable<ProfileFailureReasons> {
        const result = Observable.create((observer: Observer<ProfileFailureReasons>) => {
            User.findOne({ email: emailAddress, emailConfirmationToken: confirmationToken },
                (findError: any, originalUser: IUser | null) => {
                    /* istanbul ignore if */
                    if (findError) {
                        observer.onError(findError);
                        observer.onNext(ProfileFailureReasons.UNKNOWN);
                        observer.onCompleted();
                        return;
                    }

                    if (originalUser === null) {
                        // No user was found with the given e-mail address and confirmation token.
                        observer.onNext(ProfileFailureReasons.NON_EXISTENT_PROFILE);
                        observer.onCompleted();
                    } else if (originalUser.isEmailConfirmed) {
                        // The user that was found already had confirmed their e-mail address.
                        observer.onNext(ProfileFailureReasons.DUPLICATE_EMAIL);
                        observer.onCompleted();
                    } else {
                        if (originalUser.isDeactivated) {
                            // The user that was found is not an active user.
                            observer.onNext(ProfileFailureReasons.INACTIVE_PROFILE);
                            observer.onCompleted();
                        } else {
                            // The user that was found can have its e-mail address confirmed.
                            originalUser.isEmailConfirmed = true;
                            originalUser.save().then(
                                () => {
                                    observer.onNext(ProfileFailureReasons.NONE);
                                },
                                /* istanbul ignore next */
                                (err: any) => {
                                    // There has been an error saving the user.
                                    observer.onError(err);
                                    observer.onNext(ProfileFailureReasons.UNKNOWN);
                                }).then(() => {
                                    observer.onCompleted();
                                });
                        }
                    }
                });
        });

        return result;
    }
}
