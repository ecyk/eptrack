FROM node:latest AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /usr/src/app
COPY . .
RUN npm i && npm run build

FROM node:bookworm-slim
ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/dist dist/
COPY --chown=node:node --from=build /usr/src/app/package*.json .
RUN npm ci --omit=dev
CMD ["dumb-init", "node", "dist"]
