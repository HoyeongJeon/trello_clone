FROM node:20
ARG ENV_FILE
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ${ENV_FILE} .env
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
