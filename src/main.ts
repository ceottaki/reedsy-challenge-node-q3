import { isUndefined } from 'util';

import { App } from './app';
import { JwtAuthenticationService } from './session/jwt-authentication.service';
import { IJwtAuthenticationService } from './session/jwt-authentication.service.d';
import { SessionController } from './session/session.controller';

// Reads the port to open from the environment.
const port: number = parseInt(process.env.PORT || '5000');
// Reads the JWS secret to use for authentication from the environment.
const jwsSecret: string = process.env.JWT_SECRET || 'devsecret';
// Reads the MongoDB URI from the environment.
const mongoDbUri: string = process.env.MONGODB_URI || 'mongodb://localhost/boilerplate';
// Reads whether to mock the MongoDB data from the environment.
const mockData: boolean = isUndefined(process.env.MOCK_MONGODB_DATA)
    ? false
    : (process.env.MOCK_MONGODB_DATA as string).toUpperCase() === 'TRUE';

// Creates a singleton instance of the authentication service.
const authenticationService: IJwtAuthenticationService = new JwtAuthenticationService(jwsSecret);

// Creates the app, adds the available controllers and starts it.
const app: App = new App(port, jwsSecret, mongoDbUri, mockData);
app.addControllers([new SessionController(authenticationService)]);
app.start();
