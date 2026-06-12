const { createCorsOriginChecker } = require('./corsOrigins');

const corsOrigin = createCorsOriginChecker();

module.exports = { corsOrigin };
