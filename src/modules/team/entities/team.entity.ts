import { Club } from '../../club/entities/club.entity';
import { Member } from '../../member/entities/member.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "First Team", "U-19", "Women's Team"

  // A Team belongs to one Club
  @ManyToOne(() => Club, (club) => club.teams, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  club: Club;

  @Column({ nullable: true })
  sofa_score_id: string;

  // A Team is composed of many members
  @OneToMany(() => Member, (member) => member.team)
  members: Member[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
