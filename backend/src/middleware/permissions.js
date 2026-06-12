const { userCanAccessModule } = require('../lib/permissions');

const requireModule = (moduleKey) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  if (!userCanAccessModule(req.user, moduleKey)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have access to this module' }
    });
  }

  next();
};

module.exports = { requireModule };
