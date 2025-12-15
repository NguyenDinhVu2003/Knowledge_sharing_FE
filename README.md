# Internal Knowledge Sharing Platform - Frontend

Angular-based frontend application for the Internal Knowledge Sharing Platform.

## Project Setup (FE-1) ✅

This project has been configured with the following features:

### Technologies
- **Angular**: v20.3.0 (latest stable)
- **UI Framework**: Angular Material (Rose/Red theme)
- **HTTP Client**: Configured with `provideHttpClient` and fetch API
- **Routing**: Enabled and configured

### Environment Configuration

Two environments have been set up:

#### Development (`src/environments/environment.development.ts`)
```typescript
{
  production: false,
  apiUrl: 'http://localhost:8080/api'
}
```

#### Production (`src/environments/environment.ts`)
```typescript
{
  production: true,
  apiUrl: 'http://localhost:8080/api'
}
```

The `angular.json` is configured to automatically use the correct environment file based on the build configuration.

### Key Features Implemented

1. ✅ **Routing**: Enabled with `provideRouter` in `app.config.ts`
2. ✅ **HTTP Client**: Configured with `provideHttpClient(withFetch())` for API communication
3. ✅ **Angular Material**: Installed and configured with animations support
4. ✅ **Environment Management**: Development and production configurations with file replacements
5. ✅ **Basic App Structure**: AppComponent with router outlet ready for feature modules


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

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```


## Project Structure

```
src/
├── app/
│   ├── app.config.ts          # Application configuration with providers
│   ├── app.routes.ts          # Application routing configuration
│   ├── app.ts                 # Root component
│   ├── app.html               # Root template with router outlet
│   └── app.css                # Root component styles
├── environments/
│   ├── environment.ts         # Production environment config
│   └── environment.development.ts  # Development environment config
├── index.html
├── main.ts
└── styles.css                 # Global styles
```

## Next Steps

The application is now ready for feature module development:
- Authentication module
- User management
- Article/knowledge management
- Search and filtering
- Categories and tags

## Backend API

The application expects a Spring Boot backend running at:
- **Development**: `http://localhost:8080/api`
- **Production**: `http://localhost:8080/api` (update in production environment file)

## Additional Commands

- **Run tests**: `ng test`
- **Generate component**: `ng generate component <name>`
- **Generate service**: `ng generate service <name>`
- **Generate module**: `ng generate module <name>`

## Notes

- Angular Material theme: Rose/Red
- The project uses zoneless change detection for better performance
- Server-side rendering (SSR) is configured but can be disabled if not needed

