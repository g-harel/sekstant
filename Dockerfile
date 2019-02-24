FROM node:11.10.0-alpine

USER node

RUN mkdir -m 777 /tmp/sekstant
WORKDIR /tmp/sekstant

COPY package.json .
RUN npm install --only=production

COPY index.js .

CMD node .
