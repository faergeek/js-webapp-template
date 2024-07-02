FROM node:22.4.0-alpine

RUN apk add tini

WORKDIR /home/node

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.cache/node/corepack corepack enable && corepack install
RUN --mount=type=cache,target=/root/.local/share/pnpm/store/v3 pnpm install --frozen-lockfile

COPY src ./src/
COPY public ./public/
COPY .browserslistrc babel.config.cjs postcss.config.cjs webpack.config.js ./
RUN --mount=type=cache,target=/home/node/node_modules/.cache pnpm run build

ENV NODE_ENV=production PORT=8080
EXPOSE $PORT
USER node
ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]
