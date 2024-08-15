import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('fcm_token')
export class FcmTokenEntity {
  @PrimaryGeneratedColumn({ name: 'token_id' })
  tokenId: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'device_id', nullable: false })
  deviceId: string;

  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string;

  @Column({ name: 'fcm_timestamp', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  fcmTimestamp: Date;

  @ManyToOne(() => UserEntity, (user) => user.tokenRelation, {
    // 부모 엔티티가 업데이트되면 자식 엔티티까지 영향이 간다.
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  userIdRelation: UserEntity;
}
