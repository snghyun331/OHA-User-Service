import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { OAuthType } from '../types/user.enum';

@Entity('User')
@Unique(['oauthId'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'enum', enum: OAuthType, nullable: false })
  oauthType: OAuthType;

  @Column({ type: 'varchar', nullable: false })
  oauthId: string;

  @Column({ type: 'varchar', nullable: true })
  hashedRF: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  profileUrl: string;

  @Column({ type: 'varchar', nullable: true })
  backgroundUrl: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isWithdraw: boolean;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
