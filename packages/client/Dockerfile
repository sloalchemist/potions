FROM node:22-alpine
RUN npm install -g pnpm@9.15.4
WORKDIR /app
COPY package.json ./pnpm-lock.yaml ./
RUN pnpm install --filter client...
COPY packages/client ./
EXPOSE 8080
CMD ["pnpm", "start"]
