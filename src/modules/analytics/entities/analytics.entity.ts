import { Club } from 'src/modules/club/entities/club.entity';
import { Member } from '../..//member/entities/member.entity';
import { Team } from '../../team/entities/team.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { AnalyticsType } from '../constants/analytic-type.enum';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnalyticsType })
  type: AnalyticsType; // e.g., "player_fitness", "team_possession"

  // Use jsonb to store flexible data from SofaScore or your AI
  @Column({ type: 'jsonb' })
  report_data: object;

  @ManyToOne(() => Member, { nullable: true, onDelete: 'SET NULL' })
  generated_by: Member;

  // Link to a team (optional)
  @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
  team: Team; // For team-level analytics

  // Link to a club (optional)
  @ManyToOne(() => Club, { nullable: false, onDelete: 'CASCADE' })
  club: Club; // For team-level analytics

  @CreateDateColumn()
  created_at: Date;
}
