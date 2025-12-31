import { Club } from '../../club/entities/club.entity';
import { Team } from '../../team/entities/team.entity';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { MemberRole } from '../constants/member-role.enum';
import { MemberStatus } from '../constants/member-status.enum';

@Entity('members')
// A user can only be in a club once
@Index(['user', 'club'], { unique: true })
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
  })
  role: MemberRole;

  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.PENDING,
  })
  status: MemberStatus;

  // The User who is the member
  @ManyToOne(() => User, (user) => user.memberships, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user: User;

  // The Club they are a member of
  @ManyToOne(() => Club, (club) => club.members, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  club: Club;

  // The specific Team they are assigned to (can be nullable)
  @ManyToOne(() => Team, (team) => team.members, { nullable: true })
  team: Team;

  @CreateDateColumn()
  joined_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
