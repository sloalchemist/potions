FROM node:18-alpine

WORKDIR /usr/src/app/packages

COPY packages/server .
COPY packages/converse .
COPY packages/common .

WORKDIR /usr/src/app

COPY package.json .
COPY *.yaml .
COPY tsconfig.json .

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build
