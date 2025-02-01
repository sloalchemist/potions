FROM node:20-alpine

WORKDIR /usr/src/app/packages

COPY packages/server ./server
COPY packages/converse ./converse
COPY packages/common ./common

WORKDIR /usr/src/app

COPY package.json .
COPY *.yaml .
COPY tsconfig.json .

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

WORKDIR /usr/src/app/packages/server
CMD ["sh", "-c", "pnpm run create test-world && pnpm dev test-world"]