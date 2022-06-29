FROM node:lts AS build

WORKDIR /app

ARG NPM_TOKEN

COPY package.json package-lock.json patch.js .npmrc ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=build /app/dist/fodl /usr/share/nginx/html

ENTRYPOINT ["/entrypoint.sh"]
