# Maintenance Tracking System API - Project Guide

## 1. Project Overview

This project is a backend API for a maintenance and repair tracking domain. It is built with:

- Bun runtime
- Elysia web framework
- Drizzle ORM
- PostgreSQL
- JWT-based authentication with refresh-token rotation

The codebase is organized around Clean Architecture principles so that business rules remain stable while frameworks, transport layers, and persistence details can evolve.


### Runtime and entrypoint

Application startup flow:

1. `src/index.ts` initializes configuration.
2. Database (Drizzle) is initialized.
3. Service manager is composed (use case services + dependencies).
4. HTTP application is created and started.

Swagger UI is exposed at:

- `/swagger`

---

## 2. Project Structure

The project follows layered boundaries. The most important rule is dependency direction:

- Outer layers can depend on inner layers.
- Inner layers must not depend on outer frameworks or infrastructure.

### High-level folder map

- `src/Applications`
  - Application-level contracts, DTOs, mappers, providers, and use cases.
- `src/Domains`
  - Core domain concepts: exceptions, repository contracts, request features, value objects.
- `src/Infrastructures`
  - Technical implementations: database wiring, repository implementations, configuration.
- `src/Presentations`
  - API delivery: Elysia app bootstrap, controllers, plugins, validators.
- `src/Shared`
  - Shared constants, enums, utilities.

### Layer responsibilities

#### Domain Layer (`src/Domains`)

Purpose:

- Holds business-centric abstractions and invariants.
- Defines repository interfaces and domain exceptions.

Contains:

- `Repositories/*` interfaces (ports)
- `Exceptions/*`
- `RequestFeatures/*` (query parameters and pagination-related models)
- `Value-Objects/*`

What it should NOT do:

- Direct database queries
- Framework-specific code
- HTTP-specific behavior

#### Application Layer (`src/Applications`)

Purpose:

- Orchestrates use cases and application workflows.
- Converts between DTOs and domain models.

Contains:

- `UseCases/*` services (`AuthService`, `UserService`, `DepartmentService`)
- `DataTransferObjects/*`
- `Mappers/*`
- Service contracts under `Services/*`
- Providers such as `UserProvider`

What it should NOT do:

- Know about Elysia route details
- Know SQL or driver-specific persistence logic

#### Infrastructure Layer (`src/Infrastructures`)

Purpose:

- Implements technical details behind domain/application contracts.

Contains:

- `Database/*` (Drizzle setup, schema output location)
- `Repositories/*` concrete repository implementations
- `Core/ConfigurationManager.ts`
- Entity mapping structures in `Entities/*`

What it should NOT do:

- Own business decision rules
- Bypass application use cases to serve controllers directly

#### Presentation Layer (`src/Presentations`)

Purpose:

- Exposes HTTP endpoints and request/response contracts.

Contains:

- `Application.ts` (Elysia app setup)
- `Controllers/*` (Auth, User, Department)
- `Validators/*` (payload schemas)
- `Plugins/*` (JWT plugin, centralized error handling)

What it should do:

- Validate inputs
- Delegate logic to application services
- Translate exceptions to HTTP responses

---

## 3. Usage Guide

## Prerequisites

- Bun installed
- PostgreSQL available
- Environment variables configured

### Required environment variables

Based on `ConfigurationManager`, these variables are expected:

- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (optional, default: `15m`)
- `REFRESH_TOKEN_EXPIRES_IN` (optional, default: `7d`)
- `PORT` (optional, default: `3000`)

### Run locally

1. Install dependencies:

```bash
bun install
```

2. Start development server:

```bash
bun run dev
```

3. Open API docs:

- `http://localhost:3000/swagger`

### Typical API flow

1. Call `/authentication/login` to get access token and refresh cookie.
2. Use access token for protected endpoints (`/users/*`, `/department/*`).
3. Call `/authentication/refresh` when access token expires.
4. Call logout endpoints to revoke refresh token sessions.

---

## 4. Clean Architecture in This Project

This repository applies Clean Architecture by separating policy from detail.

### Dependency direction

The stable center is domain and application logic. Framework and database details are outside.

- `Presentations` -> depends on `Applications`
- `Infrastructures` -> implements contracts defined by `Domains` and used by `Applications`
- `Domains` -> independent of Elysia/Drizzle

### Request lifecycle example

User search request (`POST /users/search`):

1. Controller validates request body with schema.
2. Controller delegates to application service (`userService`).
3. Application service builds use-case logic and uses repository contracts.
4. Infrastructure repository executes DB queries through Drizzle.
5. Result returns upward; controller sets pagination headers and response status.

### Why this helps

- Easier testing: business logic can be tested with mocked repositories.
- Easier maintenance: route or DB changes have less impact on core rules.
- Easier extension: new features can follow existing use-case + repository contract patterns.

### How to add a new feature (recommended pattern)

1. Define or update domain contract and exceptions in `Domains`.
2. Implement repository/technical details in `Infrastructures`.
3. Add DTOs and use-case logic in `Applications`.
4. Expose endpoint, validation, and plugin integration in `Presentations`.
5. Register service/controller via existing manager factories.

Keeping this sequence preserves clean boundaries and avoids framework leakage into business logic.


## 5. Code Style
Use PascalCase or UpperCamelCase to define methods and Classes. Use 'I' as a prefix of a class contract. Functions and variables can be use camelCase as usual. We use old style of C for curly braces, we put them one line after the method, class, function, if-else, and more that use curly braces.

Bad Examples:

```ts
export interface iExampleClass {
    exampleMethod() {};
}
```

```ts
export class exampleClass implements iExampleClass {
    public exampleMethod() {}
}
```

```ts
export function MyFunction() {}
```

```ts
if (a > b) {}
```

```ts
if (a > b) {

} else {

}
```

```ts
export function myFunction() {
    if (a > b) {
        console.log("TEST")
        return 0;
    }
}
```

Good Examples:

```ts
export interface IExampleClass
{
    ExampleMethod()
    {};
}
```

```ts
export class ExampleClass implements IExampleClass
{
    public ExampleMethod()
    {}
}
```

```ts
export function myFunction()
{

}
```

```ts
if (a > b)
{

}
```

```ts
if (a > b)
{

}
else
{

}
```

```ts
export function myFunction()
{
    if (a > b)
    {
        console.log("TEST")

        return 0;
    }
}
```

For the rest you may need to see the old files, how I named them and write them.

## 6. Rules
- 1. Do not touch any core files except adding new attributes such as new services or new controllers
- 2. Do not do any progress if user did not provide any information that relate to what they told you to do so eg: user want you to add recipes endpoint but you do not know what is the database schema for recipe, you must ask them to input to you.
- 3. Do not change anything beside new feature related files eg. when you are doing recipes feature, you must not touch customer related files, logics, and etc.
- 4. You can format related files if the codes are not in the 'Good Example'. But do not change any logics if the codes are not meant to changed.
- 5. You must understand all the related files before adding new features or changing anything, eg: when you want to create a new repository for recipes, you must understand `QueryBuilder.ts` to make sure you are making less mistake as possible.
- 6. You can go to `docs/databaseSchema.md` to see what's inside our database schemas.
- 7. You must understand what resources we have before implementing a new one, use what we have first unless it does not support what you want to do.
- 8. Please follow the same pattern as the old implementations especially `user` and `department` but the rest are fine too.
- 9. If there's any new route, please consider add to `openapi.yaml`
