import { ConfigurationManager } from "./Infrastructures/Core/ConfigurationManager";
import { DrizzleFactory } from "./Infrastructures/Database";
import { ServiceManagerFactory } from "./Applications/UseCases/Core/ServiceManagerFactory";
import { Application } from "./Presentations/Application";
import { createWinstonLogger } from "./Infrastructures/Logger/WinstonLogger";
import { LoggerService } from "./Infrastructures/Logger/LoggerService";

const configurationManager = new ConfigurationManager();
const loggerService = new LoggerService(createWinstonLogger(configurationManager.winston.options));

DrizzleFactory.initialize(configurationManager, loggerService);
const serviceManager = ServiceManagerFactory.initialize(configurationManager, loggerService);

const app = new Application(configurationManager, serviceManager);

app.start();
