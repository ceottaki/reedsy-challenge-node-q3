import { IRoute } from './route';

// TODO: document.

/**
 * Defines properties and methods for an implementation of a controller.
 *
 * @export
 * @interface IController
 */
export interface IController {
    readonly defaultPath: string;
    readonly apiVersion: number;
    readonly useApiVersionInPath: boolean;
    routes: IRoute[];
}
