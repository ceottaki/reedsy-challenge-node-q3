import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response, NextFunction, Router } from 'express';

import { IController } from './core/controller';
import { HttpVerbs } from './core/http-verbs.enum';

/**
 * Represents the entry point to the application.
 *
 * @export
 * @class App
 */
export class App {
    private express: express.Application;
    private router: Router;
    public readonly port: number;

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
        this.express.use(function (req: Request, res: Response, next: NextFunction) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            next();
        });

        // Sets up statically served files.
        const staticFilesPath = __dirname + '/static';
        console.log('Setting up statically served files in ' + staticFilesPath + '...');
        this.express.use(express.static(staticFilesPath));

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
        this.express.listen(this.port, function () {
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
        controller.routes.forEach(route => {
            const routePath = controller.useApiVersionInPath ? `/v${controller.apiVersion}${route.path}` : route.path;
            route.verbs.forEach(v => {
                switch (v) {
                    case HttpVerbs.ALL:
                        this.router.all(routePath, route.handler);
                        break;

                    case HttpVerbs.DELETE:
                        this.router.delete(routePath, route.handler);
                        break;

                    case HttpVerbs.GET:
                        this.router.get(routePath, route.handler);
                        break;

                    case HttpVerbs.POST:
                        this.router.post(routePath, route.handler);
                        break;

                    case HttpVerbs.PUT:
                        this.router.put(routePath, route.handler);
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
        controllers.forEach(c => this.addController(c));
    }
}
