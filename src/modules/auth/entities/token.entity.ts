import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AuthTokenType } from '../constants/auth-token-type.enum';

@Entity({ name: 'auth_tokens' })
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 250, nullable: false })
  token_hash: string;

  @Column({ type: 'enum', enum: AuthTokenType, nullable: false })
  type: AuthTokenType;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
