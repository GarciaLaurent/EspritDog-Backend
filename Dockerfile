FROM node:14-alpine

ENV HTTP_PROXY=http://isp-ceg.emea.cegedim.grp:3128
ENV HTTPS_PROXY=http://isp-ceg.emea.cegedim.grp:3128
ENV NO_PROXY=docavenue.com,maiia.io,cegedim.cloud,localhost

ENV http_proxy=http://isp-ceg.emea.cegedim.grp:3128
ENV https_proxy=http://isp-ceg.emea.cegedim.grp:3128
ENV no_proxy=docavenue.com,maiia.io,cegedim.cloud,localhost

WORKDIR /opt/app

COPY package.json .npmrc yarn.lock ./
COPY packages/vaccination-stats-exporter/package.json ./packages/vaccination-stats-exporter/package.json
COPY packages/mobile-store-reviews/package.json ./packages/mobile-store-reviews/package.json

RUN yarn install

COPY . .

RUN yarn run build

