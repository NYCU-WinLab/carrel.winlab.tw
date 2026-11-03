FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# app-shell shows the build in the bottom-left corner. The image is built on
# the pull request and only retagged on merge, so the commit is a
# placeholder that nginx replaces with SITE_VERSION at run time.
ARG BUILD_TIME=
ARG BUILD_URL=
ENV NEXT_PUBLIC_BUILD_SHA=__BUILD_SHA__ \
    NEXT_PUBLIC_BUILD_TIME=$BUILD_TIME \
    NEXT_PUBLIC_BUILD_URL=$BUILD_URL
RUN bun run build

FROM nginxinc/nginx-unprivileged:1.29-alpine
# The image's entrypoint fills ${SITE_VERSION} in templates/ into conf.d/.
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV SITE_VERSION=dev
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 8080
