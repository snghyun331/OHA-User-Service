FROM node:18.14.0

RUN apt-get clean && apt-get update 

WORKDIR /app

# 1단계: 의존성 설치
COPY ./package.json /app/
COPY ./package-lock.json /app/
COPY ./yarn.lock /app/
RUN yarn install

# 2단계: 애플리케이션 파일 복사
COPY . /app

ENV TZ Asia/Seoul

EXPOSE 3000

CMD yarn start:dev

