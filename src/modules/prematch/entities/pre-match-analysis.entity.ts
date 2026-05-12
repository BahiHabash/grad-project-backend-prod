import { Entity, PrimaryGeneratedColumn, Column, Index, Unique } from 'typeorm';

@Entity('pre_match_analysis')
@Unique('UQ_team', ['teamId', 'opponentId'])
export class PreMatchAnalysisEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamId: number;

  @Column()
  opponentId: number;

  @Column({ type: 'timestamp' })
  matchDate: Date;

  @Column({ type: 'timestamp' })
  analysisTimestamp: Date;

  @Column({ type: 'jsonb' })
  trainingPlan: Record<string, any>;

  @Column({ type: 'jsonb' })
  teamSelection: Record<string, any>;

  @Column({ type: 'jsonb' })
  opponentAnalysis: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
