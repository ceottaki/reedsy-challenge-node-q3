import { IRoute } from './route';

/**
 * Defines properties and methods for an implementation of a controller.
 *
 * @export
 * @interface IController
 */
export interface IController {
    /**
     * Gets the default path to expose the controllers API.
     *
     * @type {string}
     * @memberof IController
     */
    readonly defaultPath: string;

    /**
     * Gets the version of the API exposed by this controller.
     *
     * @type {number}
     * @memberof IController
     */
    readonly apiVersion: number;

    /**
     * Gets a value indicating whether to use the API version in the path or not.
     *
     * @type {boolean}
     * @memberof IController
     */
    readonly useApiVersionInPath: boolean;

    /**
     * Gets or sets the routes exposed by this controller.
     *
     * @type {IRoute[]}
     * @memberof IController
     */
    routes: IRoute[];
}
