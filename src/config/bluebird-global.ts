// Mongoose's driver (from Mongoose 8 on) declares a subclass of the global
// Promise when it loads, which Bluebird refuses to construct, so Mongoose is
// loaded first, while Promise is still the native one.
import 'mongoose';
import * as Bluebird from 'bluebird';

/**
 * v1.1.6 runs with Bluebird as the process's global Promise:
 * cache-manager-mongodb 0.3 assigned it (`Promise = require('bluebird')`)
 * when cache.config.ts loaded the store, on every installation. The
 * backend's own async functions return native promises, but whatever calls
 * the global Promise at run time (explicit `new Promise`, library
 * internals) gets Bluebird, whose unhandled rejections are printed as
 * warnings where native ones end the process (Node 15 and later). Ticket 07 step 17
 * replaces that store and installs Bluebird here, at the same point in the
 * load order, so the runtime stays v1.1.6's.
 */
global.Promise = (Bluebird as unknown) as PromiseConstructor;
