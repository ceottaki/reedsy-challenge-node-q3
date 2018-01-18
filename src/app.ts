import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as passport from 'passport';

import { NextFunction, Request, Response, Router } from 'express';
import { Connection, Mongoose } from 'mongoose';
import { PassportStatic } from 'passport';
import { ExtractJwt, Strategy, StrategyOptions, VerifiedCallback } from 'passport-jwt';

import { IController } from './core/controller';
import { HttpVerbs } from './core/http-verbs.enum';
import { MongoDbHelper } from './core/mongo-db-helper';
import { IUser, User } from './session/user.model';

// This is a requirement of Mongoose to set which promise framework it will use.
(mongoose as any).Promise = global.Promise;

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
     * @param {string} jwtSecret The secret to be used to encrypt and decrypt JWT tokens.
     * @param {string} mongoDbUri The URI to be used when connecting to MongoDB.
     * @memberof App
     */
    constructor(port: number, jwtSecret: string, mongoDbUri: string) {
        this.express = express();
        this.port = port;

        // Sets up the body parser.
        console.log('Setting up the body parser...');
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(bodyParser.json());

        // Sets up passport authentication.
        console.log('Setting up the passport...');
        this.express.use(passport.initialize());
        App.configurePassport(passport, jwtSecret);

        // Sets up CORS.
        console.log('Setting up CORS...');
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });

        // Sets up statically served files.
        const staticFilesPath = __dirname + '/static';
        console.log('Setting up statically served files in ' + staticFilesPath + '...');
        this.express.use(express.static(staticFilesPath));

        this.router = express.Router();

        // Sets up the MongoDB connection.
        console.log('Setting up the MongoDB connection...');
        MongoDbHelper.openDatabaseConnection(mongoose, mongoDbUri);

        // Sets up what happens when the application ends.
        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                console.log('Closing MongoDB connection.');
                process.exit(0);
            });
        });
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
            const routePath = controller.useApiVersionInPath ? `/v${controller.apiVersion}${route.path}` : route.path;
            route.verbs.forEach((v) => {
                switch (v) {
                    case HttpVerbs.ALL:
                        this.router.all(
                            routePath,
                            route.isAnonymous ? this.emptyHandler : passport.authenticate('jwt', { session: false }),
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.DELETE:
                        this.router.delete(
                            routePath,
                            route.isAnonymous ? this.emptyHandler : passport.authenticate('jwt', { session: false }),
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.GET:
                        this.router.get(
                            routePath,
                            route.isAnonymous ? this.emptyHandler : passport.authenticate('jwt', { session: false }),
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.POST:
                        this.router.post(
                            routePath,
                            route.isAnonymous ? this.emptyHandler : passport.authenticate('jwt', { session: false }),
                            route.handler.bind(controller));
                        break;

                    case HttpVerbs.PUT:
                        this.router.put(
                            routePath,
                            route.isAnonymous ? this.emptyHandler : passport.authenticate('jwt', { session: false }),
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
     * Configures passport for the type of authentication used by this app.
     *
     * @private
     * @static
     * @param {PassportStatic} ppt The static passport to be configured.
     * @param {string} jwsSecret The JWT secret to use for encryption.
     * @memberof App
     */
    private static configurePassport(ppt: PassportStatic, jwtSecret: string): void {
        const options: StrategyOptions = {
            secretOrKey: jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        };

        const strategy: Strategy = new Strategy(options, (payload: any, done: VerifiedCallback) => {
            User.findOne({ id: payload.id }, (err: any, user: IUser | null) => {
                if (err) {
                    done(err, null);
                    return;
                }

                if (user) {
                    done(null, user);
                } else {
                    done(null, null);
                }
            });
        });

        ppt.use(strategy);
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
