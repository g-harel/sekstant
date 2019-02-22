FROM node:11.10.0-alpine

WORKDIR /tmp/sekstant

COPY package.json .
RUN npm install --only=production

COPY index.js .

CMD node .
