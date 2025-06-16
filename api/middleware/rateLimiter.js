const { RateLimiterRedis } = require('rate-limiter-flexible');
const { createClient } = require('redis');

const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD || 'redis123'}@${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // Redis接続確認
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    if (rejRes instanceof Error) {
      console.error('Rate limiter error:', rejRes);
      // Redis接続エラーの場合はレート制限をスキップ
      return next();
    }
    
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`
    });
  }
};

module.exports = rateLimiterMiddleware;