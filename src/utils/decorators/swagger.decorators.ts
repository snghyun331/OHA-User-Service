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
    description: 'New 유저는 유저 정보가 반환되고, 기존(exist) 회원은 로그인 성공 및 토큰이 발급됩니다.',
    content: {
      'application/json': {
        examples: {
          예시1: {
            description: '기존 회원인 경우 응답값',
            value: {
              statusCode: 200,
              message: '로그인 성공했습니다',
              data: {
                type: 'exist',
                isNameExist: true,
                accessToken: 'eyJhbGciOiJ',
                refreshToken: 'eyJhbGciOiJ',
                userInfo: {
                  providerType: 'GOOGLE',
                  email: 'snghyun331@gmail.com',
                  name: 'もんぺ.2',
                  profileUrl: null,
                  isWithdraw: false,
                  createdAt: '2024-02-07T06:06:40.729Z',
                  updatedAt: '2024-02-29T12:48:06.732Z',
                },
              },
            },
          },
          예시2: {
            description: 'New 회원인 경우 응답값',
            value: {
              statusCode: 200,
              message: '새로운 유저가 성공적으로 로그인 되었습니다',
              data: {
                type: 'new',
                isNameExist: false,
                accessToken: 'eyJhbGciOiJ',
                refreshToken: 'eyJhbGciOiJ',
                userInfo: {
                  providerType: 'GOOGLE',
                  email: 'snghyun331@gmail.com',
                  name: null,
                  profileUrl: null,
                  isWithdraw: false,
                  createdAt: '2024-02-07T06:06:40.729Z',
                  updatedAt: '2024-02-29T12:48:06.732Z',
                },
              },
            },
          },
        },
      },
    },
  });

export const ApiResponseCompleteTermSuccess = () =>
  ApiCreatedResponse({
    description: '약관동의 완료 시, 가입 및 로그인이 완료됩니다',
    content: {
      'application/json': {
        example: {
          statusCode: 201,
          message: '새로운 유저가 성공적으로 로그인 되었습니다',
          data: {
            type: 'new',
            isNameExist: false,
            accessToken: 'eyJhbGciO~~',
            refreshToken: 'eyJhbGciO~~',
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
