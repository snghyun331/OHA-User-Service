import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('User-Freq-District')
export class UserFreqDistrictEntity {
  @PrimaryGeneratedColumn()
  freqId: number;

  @Column({ type: 'numeric', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  code: string;
}
