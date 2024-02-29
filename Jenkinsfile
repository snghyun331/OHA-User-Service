pipeline {
    agent any
    environment {
        HOST = credentials('host')
        PORT1 = credentials('port1')
        PORT2 = credentials('port2')
        DB_HOST = credentials('db_host')
        DB_PORT = credentials('db_port')
        DB_USER = credentials('db_user')
        DB_PW = credentials('db_pw')
        DB_NAME = credentials('db_name')
        OAUTH_GOOGLE_ID = credentials('oauth_google_id')
        OAUTH_GOOGLE_SECRET = credentials('oauth_google_secret')
        OAUTH_GOOGLE_REDIRECT = credentials('oauth_google_redirect')
        OAUTH_KAKAO_ID = credentials('oauth_kakao_id')
        OAUTH_KAKAO_SECRET = credentials('oauth_kakao_secret')
        OAUTH_KAKAO_REDIRECT = credentials('oauth_kakao_redirect')
        OAUTH_NAVER_ID = credentials('oauth_naver_id')
        OAUTH_NAVER_SECRET = credentials('oauth_naver_secret')
        OAUTH_NAVER_REDIRECT = credentials('oauth_naver_redirect')
        JWT_SECRET_KEY = credentials('jwt_secret_key')
        JWT_REFRESH_SECRET_KEY = credentials('jwt_refresh_secret_key')
        JWT_ACCESS_EXPIRATION_TIME = credentials('jwt_access_expiration_time')
        JWT_REFRESH_EXPIRATION_TIME = credentials('jwt_refresh_expiration_time')
        Eureka_HOST = credentials('eureka_host')
        Eureka_PORT = credentials('eureka_port')
    }

    stages {
        stage('Clone') {
            steps {
                echo 'Cloning dev.................'
                checkout scmGit(branches: [[name: '*/dev']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/O-H-A/OHA-User-Service.git']])
            }
        }

        stage('Deleting latest containers and images') {
            steps {
                echo 'Deleting .env file......'
                sh 'rm -f ./src/configs/env/.product.env || true'
                script {
                    echo 'Deleting latest containers for user.............'
                    sh 'docker kill user || true'  // 컨테이너가 없을 경우 에러 무시
                    sh 'docker rm user || true'
                }
                echo 'Deleting latest images............'
                sh 'docker rmi -f $(docker images -q --filter "reference=snghyun/*") || true'
            }
        }

        stage('Build Docker images And Deploy') {
            steps {
                script {
                    echo "inserting env variables ............"
                    dir('./src/configs/env') {
                        sh '''
                            echo "HOST=${HOST}" > .product.env
                            echo "PORT1=${PORT1}" >> .product.env
                            echo "PORT2=${PORT2}" >> .product.env
                            echo "DB_HOST=${DB_HOST}" >> .product.env
                            echo "DB_PORT=${DB_PORT}" >> .product.env
                            echo "DB_USER=${DB_USER}" >> .product.env
                            echo "DB_PW=${DB_PW}" >> .product.env
                            echo "DB_NAME=${DB_NAME}" >> .product.env
                            echo "OAUTH_GOOGLE_ID=${OAUTH_GOOGLE_ID}" >> .product.env
                            echo "OAUTH_GOOGLE_SECRET=${OAUTH_GOOGLE_SECRET}" >> .product.env
                            echo "OAUTH_GOOGLE_REDIRECT=${OAUTH_GOOGLE_REDIRECT}" >> .product.env
                            echo "OAUTH_KAKAO_ID=${OAUTH_KAKAO_ID}" >> .product.env
                            echo "OAUTH_KAKAO_SECRET=${OAUTH_KAKAO_SECRET}" >> .product.env
                            echo "OAUTH_KAKAO_REDIRECT=${OAUTH_KAKAO_REDIRECT}" >> .product.env
                            echo "OAUTH_NAVER_ID=${OAUTH_NAVER_ID}" >> .product.env
                            echo "OAUTH_NAVER_SECRET=${OAUTH_NAVER_SECRET}" >> .product.env
                            echo "OAUTH_NAVER_REDIRECT=${OAUTH_NAVER_REDIRECT}" >> .product.env
                            echo "JWT_SECRET_KEY=${JWT_SECRET_KEY}" >> .product.env
                            echo "JWT_REFRESH_SECRET_KEY=${JWT_REFRESH_SECRET_KEY}" >> .product.env
                            echo "JWT_ACCESS_EXPIRATION_TIME=${JWT_ACCESS_EXPIRATION_TIME}" >> .product.env
                            echo "JWT_REFRESH_EXPIRATION_TIME=${JWT_REFRESH_EXPIRATION_TIME}" >> .product.env
                            echo "Eureka_HOST=${Eureka_HOST}" >> .product.env
                            echo "Eureka_PORT=${Eureka_PORT}" >> .product.env
                        '''
                    }
                }
                sh 'docker build -t oha_user .'
                sh 'mkdir -p /home/upload'
                sh 'docker run -d -p 3000:3000 --name user -v /home/upload:/home/upload oha_user'
            }
        }

        stage('Tag and Push to Hub') {
            steps {
                echo "Tagging and pushing to hub.................."
                script {
                    stage ("user Push") {
                        echo "user Pushing..."
                        withCredentials([string(credentialsId: 'docker_pwd', variable: 'docker_hub_pwd')]) {
                            def imageTag = "snghyun/oha_user:${BUILD_NUMBER}"
                            // 이미지 태깅
                            sh "docker tag oha_user ${imageTag}"
                            // Hub에 로그인
                            sh "docker login -u snghyun331@gmail.com -p ${docker_hub_pwd}"
                            // 이미지를 허브로 푸쉬
                            sh "docker push ${imageTag}"
                        }
                    }
                }
            }
        }
    }
}
