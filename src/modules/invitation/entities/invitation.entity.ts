import { Club } from '../../club/entities/club.entity';
import { Team } from '../../team/entities/team.entity';
import { Member } from '../../member/entities/member.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { MemberRole } from '../../member/constants/member-role.enum';
import { InvitationStatus } from '../constants/invitation-status.enum';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index() // So you can find invites by email
  email: string;

  @Column({ unique: true })
  @Index() // For finding the invite from the email link
  token: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
  })
  role: MemberRole; // The role they are being invited for

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  // The Club this invite is for
  @ManyToOne(() => Club, { nullable: false })
  club: Club;

  // The specific Team this invite is for (can be optional)
  @ManyToOne(() => Team, { nullable: true })
  team: Team;

  // The Member who SENT the invitation (updated for club context)
  @ManyToOne(() => Member)
  invited_by: Member;

  @CreateDateColumn()
  created_at: Date;
}
