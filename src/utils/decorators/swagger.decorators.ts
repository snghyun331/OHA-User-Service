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

export const ApiDescription = (summary: string) => ApiOperation({ summary });

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

export const ApiResponseLoginSuccess = () =>
  ApiCreatedResponse({
    description: 'type: new -> 새로운 회원, exist -> 기존 회원',
    schema: {
      example: {
        statusCode: 200,
        message: '로그인 성공했습니다',
        data: {
          type: 'exist',
          isNameExist: 'false',
          accessToken: 'e~',
          refreshToken: 'e~',
        },
      },
    },
  });

export const ApiResponseErrorBadRequest = (des: string) => ApiResponse({ status: 400, description: des });

export const ApiResponseErrorUnauthorized = (des: string) => ApiResponse({ status: 401, description: des });

export const ApiResponseErrorNotFound = (des: string) => ApiResponse({ status: 404, description: des });

export const ApiResponseErrorConflict = (des: string) => ApiResponse({ status: 409, description: des });

export const ApiExclude = () => ApiExcludeEndpoint();
