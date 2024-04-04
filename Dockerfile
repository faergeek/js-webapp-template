FROM node:21.7.2-alpine

RUN apk add tini

WORKDIR /home/node

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack install
RUN pnpm install --frozen-lockfile

COPY src ./src/
COPY public ./public/
COPY .browserslistrc babel.config.cjs postcss.config.cjs webpack.config.js ./
RUN pnpm run build

ENV NODE_ENV=production PORT=8080
EXPOSE $PORT
USER node
ENTRYPOINT ["tini", "--"]
CMD ["pnpm", "start"]
