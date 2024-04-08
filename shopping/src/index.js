import express from 'express';
import config from './config/index.js'; // Adjust the path accordingly
import { databaseConnection } from './database/index.js'; // Adjust the path accordingly
import setupExpressApp from './express-app.js'; // Adjust the path accordingly
import { CreateChannel } from './utils/index.js';
import setupSentryCapture from "./utils/sentry-capturer.js"; // Adjust the path accordingly

const startServer = async () => {
    const app = express();

    await databaseConnection();

    const channel = await CreateChannel();

    await setupExpressApp(app, channel);

    setupSentryCapture(app);

    app.listen(config.PORT, () => {
        console.log(`Listening to port ${config.PORT}`);
    }).on('error', (err) => {
        console.log('ERROR HERE', err)
        process.exit();
    });
};

await startServer();
