const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Serverless functions are frozen/reused between invocations, so keep the
// connection (and the in-flight connect promise) on a module-level cache
// instead of opening a new connection on every request.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const { MONGODB_URI, MONGODB_DB, MONGODB_USERNAME, MONGODB_PASSWORD } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  if (!MONGODB_DB) {
    throw new Error('MONGODB_DB is not set');
  }

  if (!cached.promise) {
    const options = {
      dbName: MONGODB_DB,
      bufferCommands: false,
      maxPoolSize: 5,
    };

    // Passed as options (not embedded in the URI) so special characters in the
    // password don't need URL-encoding.
    if (MONGODB_USERNAME && MONGODB_PASSWORD) {
      options.user = MONGODB_USERNAME;
      options.pass = MONGODB_PASSWORD;
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((m) => {
        console.log('MongoDB connected successfully', m.connection.host, m.connection.name);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // allow the next request to retry
        throw err; // never process.exit() in serverless
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;