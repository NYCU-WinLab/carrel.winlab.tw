FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# CD passes the build identity; app-shell shows it in the bottom-left corner.
ARG BUILD_SHA=
ARG BUILD_TIME=
ARG BUILD_URL=
ENV NEXT_PUBLIC_BUILD_SHA=$BUILD_SHA \
    NEXT_PUBLIC_BUILD_TIME=$BUILD_TIME \
    NEXT_PUBLIC_BUILD_URL=$BUILD_URL
RUN bun run build

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 8080
