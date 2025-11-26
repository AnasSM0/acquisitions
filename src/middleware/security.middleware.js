import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;

    switch (role) {
      case 'admin':
        limit = 100;
        break;

      case 'user':
        limit = 20;
        break;

      case 'guest':
      default:
        limit = 10;
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot detected:', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied for bots',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield Blocked request:', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security shield',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Rate limit exceeded',
      });
    }

    next();
  } catch (error) {
    console.error('Arcjet Middleware Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong with the security middleware.',
    });
  }
};

export default securityMiddleware;
