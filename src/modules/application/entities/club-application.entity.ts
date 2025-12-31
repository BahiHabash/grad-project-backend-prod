import { Club } from '../../club/entities/club.entity';
import { User } from '../..//user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApplicationStatus } from '../constats/application-status.enum';

@Entity('club_applications')
export class ClubApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Information about the proposed club
  @Column()
  club_name: string;

  @Column({ nullable: true })
  country: string;

  // Store uploaded doc info
  @Column({ type: 'jsonb', nullable: true })
  documents: { type: string; url: string; uploaded_at: Date }[];

  @Index()
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING_DOCUMENTS,
  })
  status: ApplicationStatus;

  // Notes from the reviewer for rejection or doc requests
  @Column({ type: 'text', nullable: true })
  reviewer_notes: string;

  // The User who submitted this application
  @ManyToOne(() => User)
  applicant: User;

  // The User who reviewed this application
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  reviewer: User;

  // Once APPROVED, link to the actual club that was created
  @OneToOne(() => Club, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  created_club: Club;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
