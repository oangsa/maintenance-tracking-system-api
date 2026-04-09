import Elysia from "elysia";
import { ILoggerService } from "../../Applications/Services/ILoggerService";

export const RequestLoggerPlugin = (logger: ILoggerService) =>
    new Elysia({ name: "request-logger" })
        .onRequest((context) =>
        {
            const request = context.request;

            let path = request.url;
            let query: string | undefined;

            try
            {
                const parsed = new URL(request.url);
                path = parsed.pathname;
                query = parsed.search || undefined;
            }
            catch
            {
                query = undefined;
            }

            logger.info("Incoming API request", {
                method: request.method,
                path,
                query,
            });
        });
