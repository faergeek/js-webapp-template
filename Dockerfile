FROM node:22.20.0-alpine
RUN apk add --no-cache tini
WORKDIR /home/node

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.cache/node/corepack corepack enable pnpm

COPY workspace ./workspace/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store/v3 pnpm install --frozen-lockfile

COPY .browserslistrc .swcrc webpack.config.js ./
RUN --mount=type=cache,target=/home/node/node_modules/.cache pnpm run build

ENV NODE_ENV=production PORT=8080
EXPOSE $PORT
USER node
ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]
