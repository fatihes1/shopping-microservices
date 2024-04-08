import Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import config from '../config/index.js';
import {AuthorizationError, NotFoundError, ValidationError} from "./app-errors.js";


export default async function setupSentryCapture(app) {

    Sentry.init({
        dsn: config.SENTRY_DSN,
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
    });

    // The request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    // The error handler must be registered before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());

    // Catch all errors and format and report to logger
    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        const data = err.data || err.message

        let reportError = true;

        // Skip common/known errors
        [NotFoundError, ValidationError, AuthorizationError].forEach((typeOfError) => {
            if (err instanceof typeOfError) {
                reportError = false;
            }
        })

        if (reportError) {
            Sentry.captureException(err);
        }

        return res.status(statusCode).json({ error: data });
    });

}