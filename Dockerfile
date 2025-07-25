FROM node:22.17.1-alpine
RUN apk add --no-cache tini
WORKDIR /home/node

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.cache/node/corepack corepack enable && corepack install
RUN --mount=type=cache,target=/root/.local/share/pnpm/store/v3 pnpm install --frozen-lockfile

COPY src ./src/
COPY public ./public/
COPY .browserslistrc .swcrc webpack.config.js ./
RUN --mount=type=cache,target=/home/node/node_modules/.cache pnpm run build

ENV NODE_ENV=production PORT=8080
EXPOSE $PORT
USER node
ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]
