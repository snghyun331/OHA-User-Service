import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProviderType } from '../../module/user/enum/enum';
import { UserGradeEnum, YNEnum } from 'src/common/enum/enum';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'is_joined', type: 'enum', enum: YNEnum, default: YNEnum.NO, nullable: false })
  isJoined: YNEnum;

  @Column({ name: 'provider_type', type: 'enum', enum: ProviderType, nullable: false })
  providerType: ProviderType;

  @Column({ name: 'provider_id', type: 'varchar', nullable: false })
  providerId: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string;

  @Column({ name: 'hashed_refresh_token', type: 'varchar', nullable: true })
  hashedRF: string;

  @Column({ name: 'encrypted_fcm_token', type: 'varchar', nullable: true })
  encryptedFCM: string;

  @Column({ name: 'fcm_timestamp', type: 'timestamp', nullable: true })
  FCMTimestamp: Date;

  @Column({ name: 'nickname', type: 'varchar', nullable: true })
  name: string;

  @Column({ name: 'profile_url', type: 'varchar', nullable: true })
  profileUrl: string;

  @Column({ name: 'user_grade', type: 'enum', enum: UserGradeEnum, default: UserGradeEnum.USER, nullable: false })
  userGrade: UserGradeEnum;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;
}
