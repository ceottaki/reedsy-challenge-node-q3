import * as jwt from 'jsonwebtoken';
import { Mockgoose } from 'mockgoose';
import * as mongoose from 'mongoose';

import { MongoDbHelper } from '../core/mongo-db-helper';
import { JwtAuthenticationService } from './jwt-authentication.service';
import { LogOnInfo } from './logOnInfo.model';
import { IUser, User } from './user.model';

// This is a requirement of Mongoose to set which promise framework it will use.
(mongoose as any).Promise = global.Promise;

let originalJasmineTimeout: number;

const invalidUser: string = 'bladibla@somewhere.com';

describe('JWT Authentication Service', () => {
    beforeAll((done) => {
        // Jasmine's timeout needs to be increased a lot because when running the tests for the first time...
        // ...MongoDB will be downloaded by Mockgoose to allow mocking to happen.
        originalJasmineTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

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
        service.logOn(
            new LogOnInfo(MongoDbHelper.confirmedValidUser, MongoDbHelper.validPassword)).subscribe((token) => {
                expect(token).toBeTruthy();
                done();
            });
    });

    it('should not log on a valid user with the incorrect password', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(
            new LogOnInfo(MongoDbHelper.confirmedValidUser, MongoDbHelper.invalidPassword)).subscribe((token) => {
                expect(token).toBeFalsy();
                done();
            });
    });

    it('should not log on a valid unconfirmed user with the correct password', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(
            new LogOnInfo(MongoDbHelper.unconfirmedValidUser, MongoDbHelper.validPassword)).subscribe((token) => {
                expect(token).toBeFalsy();
                done();
            });
    });

    it('should not log on a valid unconfirmed user with the incorrect password', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(
            new LogOnInfo(MongoDbHelper.unconfirmedValidUser, MongoDbHelper.invalidPassword)).subscribe((token) => {
                expect(token).toBeFalsy();
                done();
            });
    });

    it('should not log on an invalid user', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(new LogOnInfo(invalidUser, MongoDbHelper.validPassword)).subscribe((token) => {
            expect(token).toBeFalsy();
            done();
        });
    });

    it('should successfully log out a logged in user', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(
            new LogOnInfo(MongoDbHelper.confirmedValidUser, MongoDbHelper.validPassword)).subscribe((token) => {
                const payload: any = jwt.verify(token as string, 'jwtSecret');
                User.findById(payload._id, (err: any, user: IUser | null) => {
                    service.logOut(user as IUser, payload.jti).subscribe((succeeded: boolean) => {
                        expect(succeeded).toBe(true);
                        done();
                    });
                });
            });
    });

    it('should add the current token to the user\'s blacklist when logged out', (done) => {
        const service = new JwtAuthenticationService('jwtSecret');
        service.logOn(
            new LogOnInfo(MongoDbHelper.confirmedValidUser, MongoDbHelper.validPassword)).subscribe((token) => {
                const payload: any = jwt.verify(token as string, 'jwtSecret');
                User.findById(payload._id, (err: any, user: IUser | null) => {
                    service.logOut(user as IUser, payload.jti).subscribe((succeeded: boolean) => {
                        expect((user as IUser).blacklistedTokens.indexOf(payload.jti)).toBeGreaterThanOrEqual(0);
                        done();
                    });
                });
            });
    });
});
