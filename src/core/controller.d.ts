import { IRoute } from './route';

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
