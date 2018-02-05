import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'mongoose';
import { isUndefined } from 'util';

import { BaseController } from '../core/base.controller';
import { HttpVerbs } from '../core/http-verbs.enum';
import { IStandardResponse } from '../core/standard-response';
import { IUser } from '../core/user.model';
import { ProfileFailureReasons } from './profile-failure-reasons.enum';
import { IProfileService } from './profile.service.d';

export class ProfileController extends BaseController {
    private profileService: IProfileService;

    constructor(profileService: IProfileService) {
        super('/profile', 1);
        this.profileService = profileService;

        this.routes.push(
            {
                path: this.defaultPath,
                handler: this.postProfile,
                verbs: [HttpVerbs.POST],
                isAnonymous: true
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

        this.profileService.createNewProfile(user).subscribe((reason: ProfileFailureReasons) => {
            result.success = reason === ProfileFailureReasons.NONE;
            switch (reason) {
                case ProfileFailureReasons.NONE:
                    result.message += 'Your profile has been created successfully. ';
                    break;

                case ProfileFailureReasons.DUPLICATE_EMAIL:
                    result.message += 'An account with this e-mail address already exists. ';
                    break;

                case ProfileFailureReasons.INACTIVE_PROFILE:
                    result.message += 'The account is currently inactive. ';
                    break;

                case ProfileFailureReasons.MISSING_REQUIRED:
                    result.message += 'A required field is missing from your profile. ';
                    break;

                case ProfileFailureReasons.UNCONFIRMED_EMAIL:
                    result.message += 'The e-mail address for this account has not been confirmed yet. ';
                    break;

                case ProfileFailureReasons.UNKNOWN:
                default:
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
}
