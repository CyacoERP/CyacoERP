# CyacoERP Monorepo

This repository is organized in two main applications:

- `frontend/`: Angular 21 application.
- `backend/`: NestJS + Prisma API.

## Frontend Development Server

To start a local development server, run:

```bash
cd frontend
npm install
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Frontend Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
cd frontend
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Frontend Build

To build the project run:

```bash
cd frontend
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Frontend Unit Tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
cd frontend
npm test
```

## Backend Development Server

To start the backend API in development mode:

```bash
cd backend
npm install
npm run start:dev
```

API base URL: `http://localhost:3000/api`

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
cd backend
npm run test:e2e
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
