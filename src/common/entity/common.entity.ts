import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class CommonEntity {
  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;
}
