FROM node:21.5.0 AS builder
WORKDIR /usr/src/app

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini.asc /tini.asc
RUN gpg --batch --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 595E85A6B1B4779EA4DAAEC70B588DFF0527A9B7
RUN gpg --batch --verify /tini.asc /tini
RUN chmod +x /tini

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY src ./src/
COPY .browserslistrc babel.config.cjs postcss.config.cjs webpack.config.js ./
COPY public ./public/
RUN yarn run build

FROM node:21.5.0-slim
WORKDIR /usr/src/app

COPY --from=builder /tini /
ENTRYPOINT ["/tini", "--"]

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile --production

COPY --from=builder /usr/src/app/build ./build
COPY public ./public/

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE $PORT
USER node
CMD ["yarn", "start"]
