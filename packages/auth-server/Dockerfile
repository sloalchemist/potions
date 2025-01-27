FROM node:22-alpine
RUN npm install -g pnpm@9.15.4
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --filter auth-server...
COPY packages/auth-server ./
EXPOSE 3000
CMD ["pnpm", "dev"]
