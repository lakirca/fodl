# Fodl Interface

![badge](https://jenkins.redkite.app/buildStatus/icon?job=applications%2FFodl-Merge&config=master)

This is the interface for the Fodl Project.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
Please note that you need to set `NPM_TOKEN` environment variable with your access token to install typechain from our private NPM repository.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Testing on HardHat

HardHat instance will be configured automatically by MetaMask, according to [config.json](src/config.json), which is populated by CI/CD process, or during docker build.
