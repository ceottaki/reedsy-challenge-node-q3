import { App } from './app';
import { SessionController } from './session/session.controller';

// Reads the port to open from the environment.
const port: number = parseInt(process.env.PORT || '5000');;

// Creates the app, adds the available controllers and starts it.
const app: App = new App(port);
app.addControllers([new SessionController()]);
app.start();
