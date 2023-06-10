FROM node:16-buster-slim as builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
