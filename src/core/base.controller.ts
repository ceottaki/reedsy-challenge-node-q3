import { IController } from '../core/controller';
import { IRoute } from '../core/route';

/**
 * Represents the default basic implementation of a controller.
 *
 * @export
 * @abstract
 * @class BaseController
 * @implements {IController}
 */
export abstract class BaseController implements IController {
    public readonly defaultPath: string;
    public readonly apiVersion: number;
    public readonly useApiVersionInPath: boolean;
    public routes: IRoute[] = [];

    /**
     * Creates an instance of BaseController.
     * @param {string} defaultPath The default path for the routes in this controller.
     * @param {number} apiVersion The version of the API this controller exposes.
     * @param {boolean} [useApiVersionInPath=true] If set to true the apiVersion should be added to all route paths.
     * @memberof BaseController
     */
    constructor(defaultPath: string, apiVersion: number, useApiVersionInPath: boolean = true) {
        this.defaultPath = defaultPath;
        this.apiVersion = apiVersion;
        this.useApiVersionInPath = useApiVersionInPath;
    }
}
