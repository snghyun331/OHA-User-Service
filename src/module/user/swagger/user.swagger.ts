import { SwaggerMethod } from 'src/common/interface/swagger.interface';

export const USER_MY_INFO: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '현재 사용자 정보 조회',
    },
    API_OK_RESPONSE: {
      description: 'OK',
    },
    API_NOT_FOUND_RESPONSE: {
      description: '존재하지 않는 사용자',
    },
  },
  PUT: {
    API_OPERATION: {
      summary: '닉네임 및 프로필 업데이트 API',
    },
  },
};

export const USER_PROFILE_DELETE: SwaggerMethod = {
  PUT: {
    API_OPERATION: {
      summary: '프로필 사진 삭제',
    },
    API_OK_RESPONSE: {
      description: 'OK',
    },
    API_NOT_FOUND_RESPONSE: {
      description: '존재하지 않는 사용자, 프로필이 이미 삭제되었거나 존재하지 않음',
    },
  },
};

export const USER_ALL_USERS: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '모든 사용자 정보 조회',
    },
    API_OK_RESPONSE: {
      description: 'OK',
    },
  },
};

export const USER_SPECIFIC_USERS: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '특정 사용자 여러명 정보 조회 (백엔드용)',
    },
  },
};

export const USER_ONE_USER: SwaggerMethod = {
  GET: {
    API_OPERATION: {
      summary: '특정 사용자 한명 정보 조회',
    },
    API_PARAM1: {
      name: 'userId',
      description: '숫자로 입력해주세요',
    },
  },
};
