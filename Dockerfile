FROM node:18.14.0

WORKDIR /app
COPY . .
RUN yarn install

ENV TZ Asia/Seoul

EXPOSE 3000

CMD ["yarn", "start:prod"]