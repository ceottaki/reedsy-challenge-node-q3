import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpVerbs } from './http-verbs.enum';

/**
 * Defines properties and methods for an implementation of a route.
 *
 * @export
 * @interface IRoute
 */
export interface IRoute {
    path: string | RegExp | (string | RegExp)[];
    handler: (req: Request, res: Response, next: NextFunction) => any;
    verbs: HttpVerbs[];
}
