import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'mongoose';
import { isUndefined } from 'util';

import { BaseController } from '../core/base.controller';
import { HttpVerbs } from '../core/http-verbs.enum';
import { IStandardResponse } from '../core/standard-response';
import { IUser } from '../core/user.model';
import { ProfileFailureReasons } from './profile-failure-reasons.enum';
import { IProfileService } from './profile.service.d';

/**
 * Represets a profile controller.
 *
 * @export
 * @class ProfileController
 * @extends {BaseController}
 */
export class ProfileController extends BaseController {
    private profileService: IProfileService;

    /**
     * Creates an instance of ProfileController.
     *
     * @param {IProfileService} profileService The profile service.
     * @memberof ProfileController
     */
    constructor(profileService: IProfileService) {
        super('/profile', 1);
        this.profileService = profileService;

        this.routes.push(
            {
                path: new RegExp(`${this.defaultPath}\\/(\\w+)(\\/)?$`),
                handler: this.getProfile,
                verbs: [HttpVerbs.GET],
                isAnonymous: false
            },
            {
                path: this.defaultPath,
                handler: this.patchProfile,
                verbs: [HttpVerbs.PATCH],
                isAnonymous: true
            },
            {
                path: this.defaultPath,
                handler: this.postProfile,
                verbs: [HttpVerbs.POST],
                isAnonymous: true
            },
            {
                path: new RegExp(`${this.defaultPath}\\/(\\w+)(\\/)?$`),
                handler: this.putProfile,
                verbs: [HttpVerbs.PUT],
                isAnonymous: false
            },
            {
                path: this.defaultPath,
                handler: this.deleteProfile,
                verbs: [HttpVerbs.DELETE],
                isAnonymous: false
            });
    }

    /**
     * Gets the profile for the currently authenticated session.
     *
     * @param {Request} req The HTTP request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ProfileController
     */
    public getProfile(req: Request, res: Response, next: NextFunction): void {
        const user: IUser = req.user as IUser;
        const profileId: string = req.params[0] as string;
        const result: IStandardResponse = {
            success: false
        };

        if (user.id !== profileId) {
            // For now, users are only allowed to get their own profile
            // since there is no claims or roles implemented as part of this app.
            res.statusCode = 403;
            result.message = 'You are not authorised to perform this operation.';
            res.json(result);
            return;
        }

        result.success = true;
        result.data = this.profileService.cleanProfileForClient(user);

        res.statusCode = 200;
        res.json(result);
    }

    /**
     * Confirms the e-mail address of a profile.
     *
     * @param {Request} req The HTTP request that should contain in its body an emailAddress and confirmationToken.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ProfileController
     */
    public patchProfile(req: Request, res: Response, next: NextFunction): void {
        const result: IStandardResponse = {
            success: false,
            message: ''
        };

        this.profileService.confirmProfileEmailAddress(req.body.emailAddress, req.body.confirmationToken)
            .subscribe((reason: ProfileFailureReasons) => {
                result.success = reason === ProfileFailureReasons.NONE;
                switch (reason) {
                    case ProfileFailureReasons.NONE:
                        res.statusCode = 200;
                        result.message += 'Your e-mail address has been confirmed successfully. ';
                        break;

                    case ProfileFailureReasons.DUPLICATE_EMAIL:
                        res.statusCode = 409;
                        result.message += 'This e-mail address had already been confirmed. ';
                        break;

                    case ProfileFailureReasons.INACTIVE_PROFILE:
                        res.statusCode = 401;
                        result.message += 'This profile is currently inactive. ';
                        break;

                    case ProfileFailureReasons.NON_EXISTENT_PROFILE:
                        res.statusCode = 404;
                        result.message += 'A profile with the given e-mail address and confirmation token was not found. ';
                        break;

                    case ProfileFailureReasons.UNKNOWN:
                    default:
                        res.statusCode = 500;
                        result.message += 'There was an unknown error creating your profile. ';
                        break;
                }
            }, undefined, () => {
                // Subscription completed.
                if (!isUndefined(result.message)) {
                    result.message = result.message.trimRight();
                }

                res.json(result);
            });
    }

    /**
     * Creates a new entry in the profiles collection, signing up a user to the application.
     *
     * @param {Request} req The HTTP request that should contain in its body the new profile information.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ProfileController
     */
    public postProfile(req: Request, res: Response, next: NextFunction): void {
        const user: IUser = req.body as IUser;
        const result: IStandardResponse = {
            success: false,
            message: ''
        };

        this.profileService.createNewProfile(user).subscribe((reason: ProfileFailureReasons | string) => {
            if (typeof (reason) === 'string') {
                result.data = { profileId: reason };
            } else {
                result.success = reason === ProfileFailureReasons.NONE;
                switch (reason) {
                    case ProfileFailureReasons.NONE:
                        res.statusCode = 201;
                        result.message += 'Your profile has been created successfully. ';
                        break;

                    case ProfileFailureReasons.DUPLICATE_EMAIL:
                        res.statusCode = 409;
                        result.message += 'An account with this e-mail address already exists. ';
                        break;

                    case ProfileFailureReasons.INACTIVE_PROFILE:
                        res.statusCode = 401;
                        result.message += 'The account is currently inactive. ';
                        break;

                    case ProfileFailureReasons.MISSING_REQUIRED:
                        res.statusCode = 400;
                        result.message += 'A required field is missing from your profile. ';
                        break;

                    case ProfileFailureReasons.UNCONFIRMED_EMAIL:
                        res.statusCode = 409;
                        result.message += 'The e-mail address for this account has not been confirmed yet. ';
                        break;

                    case ProfileFailureReasons.UNKNOWN:
                    default:
                        res.statusCode = 500;
                        result.message += 'There was an unknown error creating your profile. ';
                        break;
                }
            }
        }, undefined, () => {
            // Subscription completed.
            if (!isUndefined(result.message)) {
                result.message = result.message.trimRight();
            }

            res.json(result);
        });
    }

    /**
     * Updates an existing entry in the profiles collection.
     *
     * @param {Request} req The HTTP request that should contain in its body the updated profile information.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ProfileController
     */
    public putProfile(req: Request, res: Response, next: NextFunction): void {
        const user: IUser = req.user as IUser;
        const profileId: string = req.params[0] as string;
        const result: IStandardResponse = {
            success: false
        };

        if (user.id !== profileId) {
            // For now, users are only allowed to update their own profile
            // since there is no claims or roles implemented as part of this app.
            res.statusCode = 403;
            result.message = 'You are not authorised to perform this operation.';
            res.json(result);
            return;
        }

        // for (const property in req.body) {
        //     if (property && req.body.hasOwnProperty(property)) {
        //     }
        // }

        res.statusCode = 501;
        result.message = 'This method has not been implemented yet.';
        res.json(result);
    }

    /**
     * Updates an existing entry in the profiles collection.
     *
     * @param {Request} req The HTTP request that should contain in its body the updated profile information.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ProfileController
     */
    public deleteProfile(req: Request, res: Response, next: NextFunction): void {
        const user: IUser = req.user as IUser;
        const result: IStandardResponse = {
            success: false,
            message: 'This method has not been implemented yet.'
        };

        res.statusCode = 501;
        res.json(result);
    }
}
