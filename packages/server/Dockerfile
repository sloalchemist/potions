FROM node:22-alpine
RUN npm install -g pnpm@9.15.4
WORKDIR /app
COPY packages/server/package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common packages/converse packages/world-generator packages/
RUN pnpm install
COPY packages/server ./
RUN mkdir -p /data
EXPOSE 4000
RUN pnpm build
RUN pnpm run create test-world
CMD ["pnpm", "dev", "test-world"]
