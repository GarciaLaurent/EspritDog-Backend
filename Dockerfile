FROM node:14-alpine

WORKDIR /opt/app

COPY package.json yarn.lock ./
COPY packages/vaccination-stats-exporter/package.json ./packages/vaccination-stats-exporter/package.json

RUN yarn install

COPY . .

RUN yarn run build

