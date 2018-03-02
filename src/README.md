NodeBackendBoilerplate
======================

This repository is an opinionated boilerplate for a [Node.js](https://nodejs.org) application that exposes a RESTful web API. It includes core components and interfaces to allow the creation of controllers in a simple way and it handles user creation and authentication, also providing a testing framework with code coverage.

A few choices have been made for this particular boilerplate:
- [TypeScript](https://www.typescriptlang.org/) was selected as the language of choice
- [Express.js](https://expressjs.com/) was selected as the web framework
- [JSON Web Tokens](https://jwt.io/) were selected as the strategy for authentication (although [Passport](http://www.passportjs.org/) is being used, so adding other authentication strategies should be fairly simple)
- [MongoDB](https://www.mongodb.com/) was selected as the backend database, with [mongoose](http://mongoosejs.com/) being used for modeling
- [Jasmine](https://jasmine.github.io) was selected as the testing framework with [Istanbul](https://istanbul.js.org/) being used for code coverage

While these choices were well thought about and made with a lot of details being considered, that is not to say that they are hardwired and will never change, one of the main goals of this boilerplate is to be as flexible as possible so that a developer with different opinions can change things to fit their thinking without too much trouble.

If in the future we change our minds and make different choices, the changes will be made as gradually as possible with a clear migration path or in a way that allows the previous option to remain. For example, we may look at migrating from Express.js to [restify](http://restify.com/) soon, but we may leave the option of using Express.js present in the project, documented and tested if that remains someone's preferred option.


## Usage

To build and run this boilerplate, first make sure you have [Node.js](https://nodejs.org) installed. At this moment this project has been tested with versions 6.12.0 and 8.9.4. Once Node.js has been installed, clone the project:
```bash
git clone git@github.com:ceottaki/NodeBackendBoilerplate.git
```
or manually [download](https://github.com/ceottaki/NodeBackendBoilerplate/archivke/master.zip) it.

Then, in the cloned folder, simply run:
```bash
npm install
```

Once all the dependencies have been installed, you can start the application:
```bash
npm start
```

Once started you should see an output in the console with the application setting itself up on port 5000. If there is a problem connecting to MongoDB, please see the [configuration](#configuration) section below.


## Configuration

The configuration is [stored in the environment](https://12factor.net/config) and these are the options:

Environment Variable | Description | Value Type | Default Value
-------------------- | ----------- | ---------- | -------------
[PORT](#port) | The port the application will listen for HTTP requests in. | number | 5000
[JWT_SECRET](#jwt-secret) | The secret that will be used to sign the authentication token. | string | 'devsecret'
[MONGODB_URI](#mongodb-uri) | The URI used to connect to MongoDB. | string | 'mongodb://localhost/boilerplate'
[MOCK_MONGODB_DATA](#mock-mongodb-data) | Whether to mock MongoDB and add mock data. | boolean | false

### Port

The port that the application will listen for HTTP requests, defaults to `5000` as most Node.js applications do. In production, this could be set to port 80, or, better yet, using a certificate to provide a secure connection with HTTPS. To use HTTPS the code will have to be changed in [app.ts](https://github.com/ceottaki/NodeBackendBoilerplate/blob/master/src/app.ts#L102) to something like this (with your own certificate files, of course):
```TypeScript
    /**
     * Stars the application by having it listen to requests.
     *
     * @memberof App
     */
    public start(): void {
        this.express.use('/api', this.router);

        console.log('Application starting on port ' + this.port.toString() + '...');

        const options: https.ServerOptions = {
            cert: fs.readFileSync('mycertfile.pem'),
            key: fs.readFileSync('myPrivKey.pem')
        };

        https.createServer(options).listen(this.port);
    }
```


### Jwt secret

The secret that will be used for signing the tokens, it defaults to `'devsecret'` which makes it simpler during develpment but it should definitely be changed. The JWT secret can be anything, but it is better if it is long and random, like `'FczuTUT8sHuTzbNGFH1cOASTqZ2Xw4VBGwaouM11kyAGjPbSZMk6LRPdJSsLQBvlZE5vWJvsTpcZvsCmPcNORsFT7TTjZWn3y9OhXf5L73NJAC4qsRrVhPc8a5ULMk'`.

If you do not need your tokens to remain valid between application restarts, then you could eliminate this from the configuration and change it to be something random at the start of the app. For example, you could replace [this line in main.ts](https://github.com/ceottaki/NodeBackendBoilerplate/blob/master/src/main.ts#L14) with this:
```TypeScript
const jwsSecret: string = crypto.randomBytes(128).toString('hex');
```


### MongoDB URI

The [connection string URI](https://docs.mongodb.com/manual/reference/connection-string/) that will be used to connect to MongoDB. Unimportant if MOCK_MONGODB_DATA is true. It defaults to `'mongodb://localhost/boilerplate'`.


### Mock MongoDB data

This will determine whether the application will run using an actual MongoDB as specified by the MONGODB_URI or if it will use an in-memory store which does not have persistence. It is very useful for development for eliminating the need to have MongoDB installed and for pre-populating the in-memory store with the same data every time the application starts. It defaults to `false`.

When set to `true`, the User schema is pre-populated with the following users, as seen in [`createMockData()`](https://github.com/ceottaki/NodeBackendBoilerplate/blob/master/src/core/mongo-db-helper.ts#L99) method of the `mongo-db-helper.ts` file:

E-mail | Password | Full name | Birthday | E-mail confirmed? | Active?
------ | -------- | --------- | -------- | ----------------- | -------
someone@somewhere.com | P@ssw0rd | Confirmed User | 01/Jan/2000 | true | true
someone-else@somewhere.com | P@ssw0rd | Unconfirmed User | 02/Jan/2000 | false | true
someone-not-anymore@somewhere.com | P@ssw0rd | Inactive User | 03/Jan/2000 | true | false
someone-else-not-anymore@somewhere.com | P@ssw0rd | Inactive Unconfirmed User | 04/Jan/2000 | false | false

This is the same data that is used by the unit tests.


## License

MIT http://ceottaki.mit-license.org/


<!-- TODO: Add a development section explaining the amenities already present for using VS Code, how to run the unit tests and code coverage, etc. -->
<!-- TODO: Add a section explaining how to call the current API, Postman, etc. -->
<!-- TODO: Add a section on how to add a new API endpoint, a new model, etc. -->
<!-- TODO: Add a section on the development practices we're using, REST levels, 12-factor, etc. -->
