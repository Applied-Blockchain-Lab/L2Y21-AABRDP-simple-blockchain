# syntax=docker/dockerfile:1

FROM node:16-alpine

COPY ["package.json", "package-lock.json*", "./"]

WORKDIR /L2Y21-AABRDP-simple-blockchain

COPY . .

RUN npm install

CMD [ "npm", "app.js" ]