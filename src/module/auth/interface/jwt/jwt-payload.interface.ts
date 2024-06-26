import { UserGradeEnum } from 'src/common/enum/enum';

export interface JwtPayload {
  userId: number;
  providerId: string;
  userGrade: UserGradeEnum;
}
