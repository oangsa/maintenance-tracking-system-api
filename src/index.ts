import { ConfigurationManager } from "./Infrastructures/Core/ConfigurationManager";
import { DrizzleFactory } from "./Infrastructures/Database";
import { ServiceManagerFactory } from "./Applications/UseCases/Core/ServiceManagerFactory";
import { Application } from "./Presentations/Application";

const configurationManager = new ConfigurationManager();

DrizzleFactory.initialize(configurationManager);
const serviceManager = ServiceManagerFactory.initialize(configurationManager);

const app = new Application(configurationManager, serviceManager);

app.start();
