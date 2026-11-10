import * as mongoose from 'mongoose';
import { mongooseConnectionFactory } from './mongoose-connection.factory';

// v1.1.6 (Mongoose 5) keeps a filter key that is not in the schema. The
// factory runs after the schemas and models are defined, as it does in the
// application, so the global option must still reach their queries.
describe('mongooseConnectionFactory', () => {
    const Probe = mongoose.model(
        'StrictQueryProbe',
        new mongoose.Schema({ known: Number }),
    );
    const castFilter = () => {
        const query = Probe.find({ known: 1, unknown: 2 });
        query.cast(Probe);
        return query.getFilter();
    };

    it('returns the connection it is given', () => {
        const connection = {} as mongoose.Connection;
        expect(mongooseConnectionFactory(connection)).toBe(connection);
    });

    it('keeps filter keys that are not in the schema, as v1.1.6 does', () => {
        mongooseConnectionFactory({} as mongoose.Connection);
        expect(mongoose.get('strictQuery')).toBe(false);
        expect(castFilter()).toEqual({ known: 1, unknown: 2 });
    });
});
