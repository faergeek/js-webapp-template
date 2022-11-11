FROM node:19
WORKDIR /usr/src/app

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini.asc /tini.asc
RUN gpg --batch --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 595E85A6B1B4779EA4DAAEC70B588DFF0527A9B7
RUN gpg --batch --verify /tini.asc /tini
RUN rm /tini.asc
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY src ./src/
COPY .browserslistrc babel.config.js postcss.config.js webpack.config.js .

RUN yarn run build
RUN yarn --frozen-lockfile --production

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE $PORT
USER node
CMD ["yarn", "start"]
