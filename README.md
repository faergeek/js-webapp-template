# js-webapp-template

## Setup

Install packages:

```sh
pnpm install
```

## Development

Launch app in dev mode:

```sh
pnpm run dev
```

## Production

Build assets for production:

```sh
pnpm run build
```

After that, you'll find all build artifacts in the `workspace/node/dist`,
`workspace/service-worker/dist` and `workspace/web-page/dist` directories.

Then you need to start the built server:

```sh
pnpm start
```

# Docker

You can also build a docker image:

```sh
docker build -t js-webapp-template .
```

And then run it:

```sh
docker run --rm -p 8080:8080 --env COOKIE_SIGNING_SECRET=this-is-supposed-to-be-a-secret js-webapp-template
```

Or most probably deploy it somewhere.

## Environment Variables

dotenv-flow reads files like `.env`, `env.local` to setup environment
variables. For details see [dotenv-flow
docs](https://github.com/kerimdzhanov/dotenv-flow)
