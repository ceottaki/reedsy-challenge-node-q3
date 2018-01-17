import { Mockgoose } from 'mockgoose';
import { Mongoose, Connection } from 'mongoose';
import { Observable } from 'rx';

// TODO: document.

export class TestHelper {
    public static SetUpMockgoose(mongoose: Mongoose): Mockgoose {
        const result: Mockgoose = new Mockgoose(mongoose);
        if (process.env.HTTP_PROXY !== undefined) {
            const httpProxy: string = <string>process.env.HTTP_PROXY;
            result.helper.setProxy(<string>process.env.HTTP_PROXY);
        }

        return result;
    }

    public static OpenDatabaseConnection(mongoose: Mongoose): Mongoose {
        mongoose.connect('mongodb://localhost/boilerplate', { useMongoClient: true });
        const mongoDbConnection: Connection = mongoose.connection;
        mongoDbConnection.on('connected', function () {
            console.log('Connected to MongoDB.');
        });
        mongoDbConnection.on('error', function (err: any) {
            console.log(`There was a problem connecting to MongoDB: ${err}`);
        });
        mongoDbConnection.on('disconnected', function () {
            console.log('Disconnected from MongoDB.');
        });

        return mongoose;
    }
}
