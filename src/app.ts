import * as bodyParser from 'body-parser';
import * as express from 'express';

import { NextFunction, Request, Response, Router } from 'express';

import { IController } from './core/controller';
import { HttpVerbs } from './core/http-verbs.enum';

/**
 * Represents the entry point to the application.
 *
 * @export
 * @class App
 */
export class App {
    public readonly port: number;
    private express: express.Application;
    private router: Router;

    /**
     * Creates an instance of App.
     * @param {number} port The port the application will listen for requests on.
     * @memberof App
     */
    constructor(port: number) {
        this.express = express();
        this.port = port;

        // Sets up the body parser.
        console.log('Setting up the body parser...');
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(bodyParser.json());

        // Sets up CORS.
        console.log('Setting up CORS...');
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });

        this.router = express.Router();
    }

    /**
     * Stars the application by having it listen to requests.
     *
     * @memberof App
     */
    public start(): void {
        this.express.use('/api', this.router);

        console.log('Application starting on port ' + this.port.toString() + '...');
        this.express.listen(this.port, () => {
            console.log('Application has started and is listening.');
        });
    }

    /**
     * Adds a controller to the application with its defined routes.
     *
     * @param {IController} controller The controller to be added.
     * @memberof App
     */
    public addController(controller: IController): void {
        controller.routes.forEach((route) => {
            let routePath: string | RegExp | Array<string | RegExp>;

            // TODO: Handle array routes when adding the API version in path.
            if (route.path instanceof RegExp) {
                routePath = new RegExp((controller.useApiVersionInPath ? `\\/v${controller.apiVersion}` : '') + route.path.source);
            } else {
                routePath = controller.useApiVersionInPath ? `/v${controller.apiVersion}${route.path}` : route.path;
            }

            route.verbs.forEach((v) => {
                switch (v) {
                    case HttpVerbs.ALL:
                        this.router.all(
                            routePath,
                            this.emptyHandler,
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.DELETE:
                        this.router.delete(
                            routePath,
                            this.emptyHandler,
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.GET:
                        this.router.get(
                            routePath,
                            this.emptyHandler,
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.PATCH:
                        this.router.patch(
                            routePath,
                            this.emptyHandler,
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.POST:
                        this.router.post(
                            routePath,
                            this.emptyHandler,
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.PUT:
                        this.router.put(
                            routePath,
                            this.emptyHandler,
                            route.handler.bind(controller));
                        break;
                }
            });
        });
    }

    /**
     * Adds many controllers to the application with their defined routes.
     *
     * @param {IController[]} controllers The array of controllers to be added.
     * @memberof App
     */
    public addControllers(controllers: IController[]): void {
        controllers.forEach((c) => this.addController(c));
    }

    /**
     * An empty HTTP request handler that simply calls the next handler.
     * It is useful within conditionals where another handler is provided in a certain scenario,
     * this one can be provided in the opposing scenario.
     *
     * @private
     * @param {Request} req The HTTP request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof App
     */
    private emptyHandler(req: Request, res: Response, next: NextFunction): void {
        next();
    }
}
