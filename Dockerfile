################################################
# 1) Builder: install deps & compile TS to JS  #
################################################
FROM node:22 AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install -g @nestjs/cli
RUN npm run build     # outputs /usr/src/app/dist

################################################
# 2) Development: run in watch mode            #
################################################
FROM node:22 AS development
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install -g @nestjs/cli

EXPOSE 4000
CMD ["npm", "run", "start:dev"]

################################################
# 3) Production: lean image for prod           #
################################################
FROM node:22 AS production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]
