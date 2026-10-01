export default () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '4000', 10),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    // Short-lived access token, longer refresh token (seconds)
    accessTtlSeconds: parseInt(process.env.JWT_ACCESS_TTL_SECONDS ?? '900', 10),
    refreshTtlSeconds: parseInt(process.env.JWT_REFRESH_TTL_SECONDS ?? '604800', 10),
  },
});
