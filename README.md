# Cyacoerp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Local Database Infrastructure (PostgreSQL + pgAdmin)

The repository now includes a local Docker setup for PostgreSQL and pgAdmin.

### 1. Prepare environment variables

Create a local `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Then adjust credentials and ports if needed.

### 2. Start containers

```bash
docker compose up -d
```

### 3. Verify services

```bash
docker compose ps
```

Expected endpoints:

- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

Default pgAdmin credentials are configured in `.env`.

### 4. Stop containers

```bash
docker compose down
```

Use `docker compose down -v` only if you want to remove persisted local data volumes.
