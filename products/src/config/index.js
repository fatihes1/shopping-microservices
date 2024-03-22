import dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotenv.config({ path: configFile });
} else {
  dotenv.config();
}


const config = {
  PORT: process.env.PORT,
  APP_SECRET: process.env.APP_SECRET,
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  DB_URL: process.env.MONGODB_URI,
  EXCHANGE_NAME: 'ONLINE_SHOPPING',
  SHOPPING_BINDING_KEY: 'SHOPPING_SERVICE',
  CUSTOMER_BINDING_KEY: 'CUSTOMER_SERVICE',
  QUEUE_NAME: 'PRODUCTS_QUEUE'
};


export default config;

