import { Mockgoose } from 'mockgoose';
import * as mongoose from 'mongoose';

import { MongoDbHelper } from '../core/mongo-db-helper';
import { JwtAuthenticationService } from './jwt-authentication.service';
import { LogOnInfo } from './logOnInfo.model';
import { IUser, User } from './user.model';

// This is a requirement of Mongoose to set which promise framework it will use.
(mongoose as any).Promise = global.Promise;

let originalJasmineTimeout: number;

const validPassword: string = 'P@ssw0rd';
const invalidPassword: string = 'bladiblah';
const confirmedValidUser: string = 'someone@somewhere.com';
const unconfirmedValidUser: string = 'someone-else@somewhere.com';
const invalidUser: string = 'bladibla@somewhere.com';

describe('JWT Authentication Service', () => {
    beforeAll((done) => {
        // Jasmine's timeout needs to be increased a lot because when running the tests for the first time...
        // ...MongoDB will be downloaded by Mockgoose to allow mocking to happen.
        const newJasmineTimeout: number = 120000;
        originalJasmineTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = newJasmineTimeout;

        // Sets up a mocked instance of MongoDB to be used through Mongoose.
        MongoDbHelper.openMockDatabaseConnection(
            mongoose,
            'mongodb://localhost/mock',
            process.env.HTTP_PROXY !== undefined ? process.env.HTTP_PROXY as string : null)
            .subscribeOnCompleted(() => {
                done();
            });
    });

    beforeEach((done) => {
        // Creates the mocked users that can be used during tests.
        MongoDbHelper.createMockData().subscribeOnCompleted(() => { done(); });
    });

    afterEach((done) => {
        // Resets the mocked database, deleting all users and any other entries.
        MongoDbHelper.resetMockData().subscribeOnCompleted(() => {
            done();
        });
    });

    afterAll((done) => {
        // Sets Jasmine's default timeout back to the original one.
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalJasmineTimeout;

        // Closes the mocked database connection.
        mongoose.connection.close().then(() => {
            done();
        });
    });

    it('should instantiate correctly', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        expect(service).toBeTruthy();
        done();
    });

    it('should log on a valid user successfully with the correct password', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(new LogOnInfo(confirmedValidUser, validPassword)).subscribe((token) => {
            expect(token).toBeTruthy();
            done();
        });
    });

    it('should not log on a valid user with the incorrect password', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(new LogOnInfo(confirmedValidUser, invalidPassword)).subscribe((token) => {
            expect(token).toBeFalsy();
            done();
        });
    });

    it('should not log on a valid unconfirmed user with the correct password', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(new LogOnInfo(unconfirmedValidUser, validPassword)).subscribe((token) => {
            expect(token).toBeFalsy();
            done();
        });
    });

    it('should not log on a valid unconfirmed user with the incorrect password', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(new LogOnInfo(unconfirmedValidUser, invalidPassword)).subscribe((token) => {
            expect(token).toBeFalsy();
            done();
        });
    });

    it('should not log on an invalid user', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(new LogOnInfo(invalidUser, validPassword)).subscribe((token) => {
            expect(token).toBeFalsy();
            done();
        });
    });
});
