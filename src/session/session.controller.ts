import { Request, Response, NextFunction, IRoute } from 'express';

import { HttpVerbs } from '../core/http-verbs.enum';
import { BaseController } from '../core/base.controller';
import { LogOnInfo } from './logOnInfo.model';

/**
 * Represents a session controller.
 *
 * @export
 * @class SessionController
 * @extends {BaseController}
 */
export class SessionController extends BaseController {
    /**
     * Creates an instance of SessionController.
     * @memberof SessionController
     */
    constructor() {
        super('/session', 1);
        this.routes.push(
            {
                path: this.defaultPath,
                handler: this.postSession,
                verbs: [HttpVerbs.POST]
            }, {
                path: this.defaultPath,
                handler: this.getSession,
                verbs: [HttpVerbs.GET]
            }, {
                path: this.defaultPath,
                handler: this.deleteSession,
                verbs: [HttpVerbs.DELETE]
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

        // TODO: Actually create a session.
        res.json({ ok: true });
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
        // TODO: Add code to get a session.
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
        // TODO: Add code to delete a session.
    }
}
