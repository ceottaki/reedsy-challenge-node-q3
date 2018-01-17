import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpVerbs } from './http-verbs.enum';

/**
 * Defines properties and methods for an implementation of a route.
 *
 * @export
 * @interface IRoute
 */
export interface IRoute {
    /**
     * Gets or sets the path that should be matched for this route.
     *
     * @type {(string | RegExp | (string | RegExp)[])}
     * @memberof IRoute
     */
    path: string | RegExp | (string | RegExp)[];

    /**
     * Gets or sets the function that should be called to handle the route.
     *
     * @memberof IRoute
     */
    handler: (req: Request, res: Response, next: NextFunction) => any;

    /**
     * Gets or sets the array of HTTP verbs that should be matched for this route.
     *
     * @type {HttpVerbs[]}
     * @memberof IRoute
     */
    verbs: HttpVerbs[];

    /**
     * Gets or sets a value indicating whether this route should be anonymous or authenticated.
     *
     * @type {boolean}
     * @memberof IRoute
     */
    isAnonymous?: boolean;
}
