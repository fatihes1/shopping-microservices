import express from 'express';
import config from './config/index.js'; // Adjust the path accordingly
import { databaseConnection } from './database/index.js'; // Adjust the path accordingly
import setupExpressApp from './express-app.js'; // Adjust the path accordingly
import { CreateChannel } from './utils/index.js'; // Adjust the path accordingly

const startServer = async () => {
    const app = express();

    await databaseConnection();

    const channel = await CreateChannel();

    await setupExpressApp(app, channel);

    app.listen(config.PORT, () => {
        console.log(`listening to port ${config.PORT}`);
    }).on('error', (err) => {
        console.log(err);
        process.exit();
    });
};

await startServer();
