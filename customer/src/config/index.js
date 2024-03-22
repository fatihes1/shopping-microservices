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
    DB_URL: process.env.MONGODB_URI,
    APP_SECRET: process.env.APP_SECRET,
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: 'ONLINE_SHOPPING',
    CUSTOMER_BINDING_KEY: 'CUSTOMER_SERVICE',
    QUEUE_NAME: 'CUSTOMER_QUEUE'
};


export default config;
