import dotenv from 'dotenv';

dotenv.config();

if (process.env.NODE_ENV !== 'prod') {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotenv.config({ path: configFile });
} else {
  dotenv.config();
}

const config = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  CUSTOMER_SERVICE: 'customer_service',
  SHOPPING_SERVICE: 'shopping_service',
  SENTRY_DSN: process.env.SENTRY_DSN,
};

export default config;
