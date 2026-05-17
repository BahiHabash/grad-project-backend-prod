import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { FavoriteTargetType } from '../../../common/enums/favorite-target-type.enum';

@Injectable()
export class FavoriteRepository extends BaseRepository<Favorite> {
  constructor(
    @InjectRepository(Favorite)
    protected readonly repo: Repository<Favorite>,
  ) {
    super(repo);
  }

  get internalRepo(): Repository<Favorite> {
    return this.repo;
  }

  /**
   * Finds all favorites for a specific user.
   */
  async findByUserId(userId: string): Promise<Favorite[]> {
    return this.repo.find({
      where: { user_id: userId },
    });
  }

  /**
   * Finds a specific favorite for a user.
   */
  async findOneByUserAndTarget(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<Favorite | null> {
    return this.repo.findOne({
      where: {
        user_id: userId,
        target_type: targetType,
        sofa_score_target_id: targetId,
      },
    });
  }
}
