import { Request, Response, NextFunction } from 'express';

import { HttpVerbs } from '../core/http-verbs.enum';
import { BaseController } from '../core/base.controller';
import { IStandardResponse } from '../core/standard-response';
import { LogOnInfo } from './logOnInfo.model';
import { IJwtAuthenticationService } from './jwt-authentication.service.d';
import { ISession } from './session.model';
import { IUser } from './user.model';

/**
 * Represents a session controller.
 *
 * @export
 * @class SessionController
 * @extends {BaseController}
 */
export class SessionController extends BaseController {
    private authenticationService: IJwtAuthenticationService;

    /**
     * Creates an instance of SessionController.
     * @param {IJwtAuthenticationService} authenticationService The authentication service.
     * @memberof SessionController
     */
    constructor(authenticationService: IJwtAuthenticationService) {
        super('/session', 1);
        this.authenticationService = authenticationService;

        this.routes.push(
            {
                path: this.defaultPath,
                handler: this.postSession,
                verbs: [HttpVerbs.POST],
                isAnonymous: true
            }, {
                path: this.defaultPath,
                handler: this.getSession,
                verbs: [HttpVerbs.GET],
                isAnonymous: false
            }, {
                path: this.defaultPath,
                handler: this.deleteSession,
                verbs: [HttpVerbs.DELETE],
                isAnonymous: false
            });
    }

    /**
     * Creates a new entry in the sessions collection, authenticating a user.
     *
     * @param {Request} req The HTTP request that should contain the following properties in its body: emailAddress and password.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof SessionController
     */
    public postSession(req: Request, res: Response, next: NextFunction): void {
        const logOnInfo: LogOnInfo = new LogOnInfo(req.body.emailAddress, req.body.password);
        if (!logOnInfo.checkValidity()) {
            next(new Error('Attempting to create a session with an incorrect request.'));
            return;
        }

        this.authenticationService.logOn(logOnInfo).subscribe(token => {
            const result: IStandardResponse = {
                success: token !== null,
                message: token !== null ? 'You have been successfully authenticated.' : 'Authentication failed. E-mail address or password incorrect.',
                data: {
                    token: token
                }
            };

            res.json(result);
        });
    }

    /**
     * Gets the currently authenticated session if any.
     *
     * @param {Request} req The HTTP request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof SessionController
     */
    public getSession(req: Request, res: Response, next: NextFunction): void {
        const user: IUser = <IUser>req.user;
        const result: ISession = {
            email: user.email,
            fullName: user.fullName
        };

        const response: IStandardResponse = {
            success: true,
            data: result
        };

        res.json(response);
    }

    /**
     * Deletes the currently authenticated session if any, logging off a user.
     *
     * @param {Request} req The HTTP request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof SessionController
     */
    public deleteSession(req: Request, res: Response, next: NextFunction): void {
        // TODO: Add code to delete a session, aka blacklist the JWT token.
    }
}
