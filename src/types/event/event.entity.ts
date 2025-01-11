import {
  Column,
  CreateDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user';
import { SchoolYearEntity } from '../schoolYear';

@Entity({ name: 'Event' })
export class EventEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  eventType: string;

  @Column()
  eventStatus: boolean;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToOne(() => SchoolYearEntity, (it) => it.events)
  schoolYear: Relation<SchoolYearEntity>;

  @Column({ type: 'boolean', default: true })
  isDisplay: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}