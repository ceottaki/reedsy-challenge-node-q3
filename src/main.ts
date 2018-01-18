import { App } from './app';
import { JwtAuthenticationService } from './session/jwt-authentication.service';
import { IJwtAuthenticationService } from './session/jwt-authentication.service.d';
import { SessionController } from './session/session.controller';

// Reads the port to open from the environment.
const port: number = parseInt(process.env.PORT || '5000');
// Reads the JWS secret to use for authentication from the environment.
const jwsSecret = process.env.JWT_SECRET || 'devsecret';
// Reads the MongoDB URI from the environment.
const mongoDbUri = process.env.MONGODB_URI || 'mongodb://localhost/boilerplate';

// Creates a singleton instance of the authentication service.
const authenticationService: IJwtAuthenticationService = new JwtAuthenticationService(jwsSecret);

// Creates the app, adds the available controllers and starts it.
const app: App = new App(port, jwsSecret, mongoDbUri);
app.addControllers([new SessionController(authenticationService)]);
app.start();
