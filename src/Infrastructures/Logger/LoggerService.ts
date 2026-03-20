import { ILoggerService } from "../../Applications/Services/ILoggerService";
import type { Logger } from "winston";

export class LoggerService implements ILoggerService
{
    private readonly _logger: Logger;

    constructor(logger: Logger)
    {
        this._logger = logger;
    }

    info(message: string, meta?: Record<string, unknown>): void
    {
        this._logger.info(message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void
    {
        this._logger.warn(message, meta);
    }

    error(message: string, error?: unknown, meta?: Record<string, unknown>): void
    {
        if (error instanceof Error)
        {
            this._logger.error(message, {
                ...meta,
                errorMessage: error.message,
                stack: error.stack,
                name: error.name,
            });
            return;
        }

        this._logger.error(message, {
            ...meta,
            error,
        });
    }

    debug(message: string, meta?: Record<string, unknown>): void
    {
        this._logger.debug(message, meta);
    }
}
