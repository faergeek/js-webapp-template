FROM node:21.6.0-alpine

RUN apk add tini

WORKDIR /home/node

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY src ./src/
COPY public ./public/
COPY .browserslistrc babel.config.cjs postcss.config.cjs webpack.config.js ./
RUN yarn run build

ENV NODE_ENV=production PORT=8080
EXPOSE $PORT
USER node
ENTRYPOINT ["tini", "--"]
CMD ["yarn", "start"]
