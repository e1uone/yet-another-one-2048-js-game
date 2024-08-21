FROM node:22.5.1-alpine3.19

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000 3001

CMD ["yarn", "dev"]
