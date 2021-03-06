# js-webapp-template

![Build status](https://github.com/faergeek/js-webapp-template/actions/workflows/main.yml/badge.svg)

## Setup

Install packages:

```sh
yarn
```

## Development

Launch app in dev mode:

```sh
yarn run dev
```

## Production

Build assets for production:

```sh
yarn run build
```

After that, you'll find all build artifacts in the build directory.

Then you need to start the built server:

```sh
yarn start
```

## Environment Variables

dotenv-flow reads files like `.env`, `env.local` to setup environment
variables. For details see [dotenv-flow
docs](https://github.com/kerimdzhanov/dotenv-flow)
