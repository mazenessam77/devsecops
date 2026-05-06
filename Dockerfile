FROM node:20-alpine AS builder

WORKDIR /app

RUN apk upgrade --no-cache && npm install -g npm@latest
COPY package*.json ./

RUN npm install

COPY . .

#STAGE 2: PROD

FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN apk upgrade --no-cache && npm install -g npm@latest
RUN addgroup -S myapp && adduser -S -G myapp myapp

COPY --from=builder --chown=myapp:myapp /app/package*.json ./
RUN npm install --only=production && npm cache clean --force

COPY --from=builder --chown=myapp:myapp /app/routes ./routes
COPY --from=builder --chown=myapp:myapp /app/server.js ./
COPY --from=builder --chown=myapp:myapp /app/db.js ./

USER myapp
EXPOSE 3000
CMD ["node", "server.js"]