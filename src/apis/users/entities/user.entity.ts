import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProviderType } from '../types/user.enum';

@Entity('User')
export class UserEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'enum', enum: ProviderType, nullable: false })
  providerType: ProviderType;

  @Column({ type: 'varchar', nullable: false })
  providerId: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  hashedRF: string;

  @Column({ type: 'varchar', nullable: true })
  encryptedFCM: string;

  @Column({ type: 'timestamptz', nullable: true })
  FCMTimestamp: Date;

  @Column({ type: 'varchar', nullable: true })
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
