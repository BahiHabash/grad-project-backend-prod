import { Member } from '../../member/entities/member.entity';
import { Team } from '../../team/entities/team.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { ClubStatus } from '../constants/club-status.enum';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  logo_url: string;

  @OneToMany(() => Member, (member) => member.club)
  members: Member[];

  @OneToMany(() => Team, (team) => team.club, { nullable: true })
  teams: Team[];

  @Column({
    type: 'enum',
    enum: ClubStatus,
    default: ClubStatus.INACTIVE,
  })
  status: ClubStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
