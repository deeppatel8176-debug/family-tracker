export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/family_tracker',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_family_tracker_access_key_2026',
  jwtExpiration: process.env.JWT_EXPIRATION || '15m',
  refreshSecret: process.env.REFRESH_SECRET || 'super_secret_family_tracker_refresh_key_2026',
  refreshExpiration: process.env.REFRESH_EXPIRATION || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  staleLocationThresholdMinutes: parseInt(process.env.STALE_LOCATION_THRESHOLD_MINUTES, 10) || 5,
  locationRetentionDays: parseInt(process.env.LOCATION_RETENTION_DAYS, 10) || 30,
});
