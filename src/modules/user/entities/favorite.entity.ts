import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from './user.entity';
import { FavoriteTargetType } from '../../../common/enums/favorite-target-type.enum';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * User's favorited SofaScore entities (leagues, teams, players).
 * Uses a polymorphic pattern: target_type + sofa_score_target_id.
 * Any user (public or club member) can have favorites.
 *
 * @relation user - The user who favorited
 */
@Entity('favorites')
@Unique('UQ_user_target', ['user_id', 'target_type', 'sofa_score_target_id'])
export class Favorite extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({
    type: 'enum',
    enum: FavoriteTargetType,
  })
  target_type: FavoriteTargetType;

  /** SofaScore entity ID (league/team/player ID) */
  @Index()
  @Column({ type: 'varchar', length: 100 })
  sofa_score_target_id: string;

  /** Display name cached for UI convenience */
  @Column({ type: 'varchar', length: 255, nullable: true })
  target_name: string | null;
}
