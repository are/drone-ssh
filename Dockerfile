FROM node:12-alpine

RUN apk add git openssh

COPY package.json /project/
COPY package-lock.json /project/

WORKDIR /project/

RUN npm ci

COPY . /project/

ENTRYPOINT [ "node", "/project/src/index.js" ]