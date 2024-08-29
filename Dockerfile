FROM node:20-alpine

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package*.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

RUN npm run build

FROM nginx:alpine
COPY --from=0 /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
