FROM node:20.12.2 AS build

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn lint

RUN yarn build:prod

FROM nginx:alpine

COPY --from=build /app/dist /var/www

COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
