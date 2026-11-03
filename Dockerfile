FROM node:24-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm exec -- nx build HabitMakerApp --configuration=production \
    && npm exec -- nx build HabitMakerApi --configuration=production

FROM node:24-alpine AS api

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /workspace/dist/apps/habit-maker-api/ ./
RUN npm ci --omit=dev && chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node", "main.js"]

FROM nginx:1.29-alpine AS app

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/dist/apps/habit-maker-app/browser/ /usr/share/nginx/html/

EXPOSE 80
