FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./tsconfig.json ./

RUN npm run build

CMD [ "npm", "start" ]
