import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ReportStatus } from '../constants/report-status.enum';

@Entity('postmatch_reports')
@Index(['event_id', 'team_id'], { unique: true })
export class PostMatchReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  event_id: string;

  @Column({ type: 'varchar', length: 100 })
  team_id: string;

  @Column({ type: 'jsonb' })
  raw_analysis: object;

  @Column({ type: 'text', nullable: true })
  llm_explanation: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  llm_model: string | null;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.COMPLETED,
  })
  status: ReportStatus;

  @Column({ type: 'uuid' })
  @Index()
  club_id: string;

  @Column({ type: 'uuid' })
  requested_by_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by_id' })
  requested_by: User;

  @Column({ type: 'timestamptz', nullable: true })
  analysis_timestamp: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
