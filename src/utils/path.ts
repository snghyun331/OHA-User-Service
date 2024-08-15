export const UPLOAD_PATH = process.env.NODE_ENV === 'local' ? '~/oha/upload/user' : '/home/upload/user';

// export const UPLOAD_PATH =
//   process.env.NODE_ENV === 'local' ? '/Users/iseunghyeon/GitPJ/upload/user' : '/home/upload/user';

export const GETNAMEBYCODES_PATH = `http://${process.env.Eureka_HOST}/api/common/location/getnamebycodes`;

export const GETCODE_PATH = `http://${process.env.Eureka_HOST}/api/common/location/getcode`;
