import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { DrizzleFactory } from "./Infrastructures/Database";
import { ConfigurationManager } from "./Infrastructures/Core/ConfigurationManager";
import { ServiceManagerFactory } from "./Applications/UseCases/Core/ServiceManagerFactory";
import { ControllerManager } from "./Presentations/Controllers/Core/ControllerManager";
import { ErrorHandlerPlugin } from "./Presentations/Plugins/ErrorHandlerPlugin";

const configurationManager = new ConfigurationManager();

DrizzleFactory.initialize(configurationManager);
const serviceManager = ServiceManagerFactory.initialize(configurationManager);

const app = new Elysia().use(ErrorHandlerPlugin).use(
  swagger({
    documentation: {
      info: {
        title: "Maintenance Tracking System API",
        version: "1.0.0",
        description: "REST API built with Elysia and Drizzle ORM",
      },
      tags: [{ name: "Users", description: "User management endpoints" }],
    },
    path: "/swagger",
  }),
);

const controllerManager = new ControllerManager(serviceManager);
controllerManager.RegisterRoutes(app as any);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(`📄 Swagger UI available at http://localhost:3000/swagger`);
