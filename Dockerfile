FROM node:20.18.0-slim AS build
WORKDIR /app
COPY . .

RUN corepack enable
RUN pnpm install --mode=skip-build && pnpm cache clean

RUN pnpm build:prod

FROM nginx:alpine
COPY --from=build /app/deploy/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Add this line to list out the files after copying
RUN ls -lR /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
