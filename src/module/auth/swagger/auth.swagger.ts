import { SwaggerMethod } from 'src/common/interface/swagger.interface';

export const AUTH_GOOGLE_LOGIN: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '구글 로그인 API',
      description: 'New 유저는 약관 동의가 완료되면 로그인 및 가입이 이루어집니다.',
    },
    API_OK_RESPONSE: {
      description:
        '기존 가입(isJoined: true) 회원은 로그인 성공 및 토큰이 발급됩니다. 아직 가입이 되지 않은 유저(isJoined: false)는 악관동의 필요 메세지와 함께 토큰 및 유저 정보가 반환됩니다.',
      content: {
        'application/json': {
          examples: {
            예시1: {
              description: '기존 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '로그인 성공했습니다',
                data: {
                  isJoined: true,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'GOOGLE',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:38:19.942Z',
                  },
                },
              },
            },
            예시2: {
              description: 'New 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '약관동의를 완료해주세요.',
                data: {
                  isJoined: false,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'GOOGLE',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:11:19.273Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const AUTH_KAKAO_LOGIN: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '카카오 로그인 API',
      description: 'New 유저는 약관 동의가 완료되면 로그인 및 가입이 이루어집니다.',
    },
    API_OK_RESPONSE: {
      description:
        '기존 가입(isJoined: true) 회원은 로그인 성공 및 토큰이 발급됩니다. 아직 가입이 되지 않은 유저(isJoined: false)는 악관동의 필요 메세지와 함께 토큰 및 유저 정보가 반환됩니다.',
      content: {
        'application/json': {
          examples: {
            예시1: {
              description: '기존 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '로그인 성공했습니다',
                data: {
                  isJoined: true,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'KAKAO',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:38:19.942Z',
                  },
                },
              },
            },
            예시2: {
              description: 'New 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '약관동의를 완료해주세요.',
                data: {
                  isJoined: false,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'KAKAO',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:11:19.273Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const AUTH_NAVER_LOGIN: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '네이버 로그인 API',
      description: 'New 유저는 약관 동의가 완료되면 로그인 및 가입이 이루어집니다.',
    },
    API_OK_RESPONSE: {
      description:
        '기존 가입(isJoined: true) 회원은 로그인 성공 및 토큰이 발급됩니다. 아직 가입이 되지 않은 유저(isJoined: false)는 악관동의 필요 메세지와 함께 토큰 및 유저 정보가 반환됩니다.',
      content: {
        'application/json': {
          examples: {
            예시1: {
              description: '기존 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '로그인 성공했습니다',
                data: {
                  isJoined: true,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'NAVER',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:38:19.942Z',
                  },
                },
              },
            },
            예시2: {
              description: 'New 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '약관동의를 완료해주세요.',
                data: {
                  isJoined: false,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'NAVER',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:11:19.273Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const AUTH_APPLE_LOGIN: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '애플 로그인 API',
      description: 'New 유저는 약관 동의가 완료되면 로그인 및 가입이 이루어집니다.',
    },
    API_OK_RESPONSE: {
      description:
        '기존 가입(isJoined: true) 회원은 로그인 성공 및 토큰이 발급됩니다. 아직 가입이 되지 않은 유저(isJoined: false)는 악관동의 필요 메세지와 함께 토큰 및 유저 정보가 반환됩니다.',
      content: {
        'application/json': {
          examples: {
            예시1: {
              description: '기존 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '로그인 성공했습니다',
                data: {
                  isJoined: true,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'APPLE',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:38:19.942Z',
                  },
                },
              },
            },
            예시2: {
              description: 'New 회원인 경우 응답값',
              value: {
                statusCode: 200,
                message: '약관동의를 완료해주세요.',
                data: {
                  isJoined: false,
                  isNameExist: false,
                  accessToken: 'e',
                  refreshToken: 'e',
                  userInfo: {
                    providerType: 'APPLE',
                    email: 'snghyun0331@gmail.com',
                    name: null,
                    profileUrl: null,
                    createdAt: '2024-04-28T11:11:19.273Z',
                    updatedAt: '2024-04-28T11:11:19.273Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const AUTH_TERMS_AGREE: SwaggerMethod = {
  PUT: {
    API_OPERATION: {
      summary: '약관동의 완료 후 호출할 API - 아직 가입 안한 유저(isJoined: false)에 해당',
    },
    API_OK_RESPONSE: {
      content: {
        'application/json': {
          example: {
            statusCode: 200,
            message: '해당 유저에 대한 약관동의가 완료되었습니다.',
          },
        },
      },
    },
  },
};

export const AUTH_REFRESH: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '엑세스 토큰 리프레시 API',
      description: '엑세스 토큰이 만료되었을 경우 해당 API로 엑세스 토큰 갱신',
    },
    API_OK_RESPONSE: {
      description: 'OK',
    },
    API_BAD_REQUEST_RESPONSE: {
      description: 'Refresh Token이 없거나 형식에 어긋날 때',
    },
    API_UNAUTHORIZED_RESPONSE: {
      description: 'Refresh Token 만료',
    },
  },
};

export const AUTH_LOGOUT: SwaggerMethod = {
  POST: {
    API_OPERATION: {
      summary: '로그아웃 API',
    },
    API_OK_RESPONSE: {
      description: 'OK',
    },
  },
};

export const AUTH_WITHDRAW: SwaggerMethod = {
  DELETE: {
    API_OPERATION: {
      summary: '회원탈퇴 API',
    },
    API_OK_RESPONSE: {
      description: 'OK',
    },
  },
};

export const AUTH_SEND_FCM: SwaggerMethod = {
  PUT: {
    API_OPERATION: {
      summary: 'FCM 토큰 전송 API',
      description: 'body로 오는 fcm 토큰은 fcm 토큰 생성 시간과 함께 DB에 저장됩니다.',
    },
  },
};
