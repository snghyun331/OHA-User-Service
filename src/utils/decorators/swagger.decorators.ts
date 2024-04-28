import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiExcludeEndpoint,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';

export const ApiTagUser = () => ApiTags('USER');

export const ApiTagAuth = () => ApiTags('AUTH');

export const ApiDescription = (summary: string, description?: string) => ApiOperation({ summary, description });

export const ApiBearerAuthAccessToken = () => ApiBearerAuth('access-token');

export const ApiBearerAuthRefreshToken = () => ApiBearerAuth('refresh-token');

export const ApiConsumesMultiForm = () => ApiConsumes('multipart/form-data');

export const ApiBodyImageForm = (fieldname: string) =>
  ApiBody({
    schema: {
      type: 'object',
      properties: {
        [fieldname]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  });

export const ApiParamDescription = (name: string, des: string) => ApiParam({ name: name, description: des });

export const ApiResponseSuccess = () => ApiResponse({ status: 200, description: 'OK' });

export const ApiResponseCreated = () => ApiResponse({ status: 201, description: 'CREATED' });

export const ApiResponseLoginSuccess = () =>
  ApiCreatedResponse({
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
  });

export const ApiResponseCompleteTermSuccess = () =>
  ApiResponse({
    description: '약관동의 완료 API (isJoined 속성이 true(가입완료)로 변경됩니다',
    content: {
      'application/json': {
        example: {
          statusCode: 200,
          message: '해당 유저에 대한 약관동의가 완료되었습니다.',
        },
      },
    },
  });

export const ApiResponseProfileUpload = () =>
  ApiResponse({
    description: '프로필 업로드 시 반환되는 이미지 url은 외부에서 바로 접근할 수 있습니다',
    content: {
      'application/json': {
        example: {
          statusCode: 200,
          message: '성공적으로 프로필이 업데이트 되었습니다',
          data: {
            imageUrl: 'http://152.67.219.168/files/user/1709225081462.jpg',
          },
        },
      },
    },
  });

export const ApiResponseErrorBadRequest = (des: string) => ApiResponse({ status: 400, description: des });

export const ApiResponseErrorUnauthorized = (des: string) => ApiResponse({ status: 401, description: des });

export const ApiResponseErrorNotFound = (des: string) => ApiResponse({ status: 404, description: des });

export const ApiResponseErrorConflict = (des: string) => ApiResponse({ status: 409, description: des });

export const ApiExclude = () => ApiExcludeEndpoint();
