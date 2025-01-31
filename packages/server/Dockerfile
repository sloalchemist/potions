FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app/packages

RUN mkdir -p ./server ./converse ./common

COPY ./packages/server/*.json ./server
COPY ./packages/server/*.yaml ./server

COPY ./packages/converse/*.json ./converse
COPY ./packages/converse/*.yaml ./converse

COPY ./packages/common/*.json ./common
COPY ./packages/common/*.yaml ./common

WORKDIR /usr/src/app

COPY *.json .
COPY *.yaml .

RUN pnpm install 

COPY ./packages/common ./packages/common
COPY ./packages/converse ./packages/converse
COPY ./packages/server ./packages/server

RUN pnpm build

WORKDIR /usr/src/app/packages/server
CMD ["sh", "-c", "pnpm run create test-world && pnpm dev test-world"]
