FROM node:21.6.0-slim

RUN apt-get update
RUN apt-get install tini

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY src ./src/
COPY .browserslistrc babel.config.cjs postcss.config.cjs webpack.config.js ./
COPY public ./public/
RUN yarn run build

RUN yarn --frozen-lockfile --production

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE $PORT
USER node
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["yarn", "start"]
