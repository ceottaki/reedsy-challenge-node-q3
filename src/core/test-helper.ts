import { Mockgoose } from 'mockgoose';
import { Connection, Mongoose } from 'mongoose';
import { Observable } from 'rx';

// TODO: document.

export class TestHelper {
    public static SetUpMockgoose(mongoose: Mongoose): Mockgoose {
        const result: Mockgoose = new Mockgoose(mongoose);
        if (process.env.HTTP_PROXY !== undefined) {
            const httpProxy: string = process.env.HTTP_PROXY as string;
            result.helper.setProxy(process.env.HTTP_PROXY as string);
        }

        return result;
    }

    public static OpenDatabaseConnection(mongoose: Mongoose): Mongoose {
        mongoose.connect('mongodb://localhost/boilerplate', { useMongoClient: true });
        const mongoDbConnection: Connection = mongoose.connection;
        mongoDbConnection.on('connected', () => {
            console.log('Connected to MongoDB.');
        });
        mongoDbConnection.on('error', (err: any) => {
            console.log(`There was a problem connecting to MongoDB: ${err}`);
        });
        mongoDbConnection.on('disconnected', () => {
            console.log('Disconnected from MongoDB.');
        });

        return mongoose;
    }
}
