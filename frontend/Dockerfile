# syntax=docker/dockerfile:1.4

FROM --platform=$BUILDPLATFORM node:lts AS development

ENV CI=true
ENV PORT=3000
ENV VITE_SERVER_URI=http://build:8000/

WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json

RUN npm ci
COPY . /code

CMD [ "npm", "run", "dev" ]

FROM development AS builder

RUN npm run build
