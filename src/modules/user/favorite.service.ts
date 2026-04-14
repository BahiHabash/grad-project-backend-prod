import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, type FindOptionsWhere } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteTargetType } from '../../common/enums/favorite-target-type.enum';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private dataSource: DataSource,
    private readonly logger: PinoLogger,
  ) {}

  async findAllByUser(
    userId: string,
    type?: FavoriteTargetType,
  ): Promise<Favorite[]> {
    const where: FindOptionsWhere<Favorite> = { user_id: userId };

    if (type) {
      where.target_type = type;
    }

    return this.favoriteRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateFavoriteDto): Promise<Favorite> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for existing favorite
      const existing = await queryRunner.manager.findOne(Favorite, {
        where: {
          user_id: userId,
          target_type: dto.target_type,
          sofa_score_target_id: dto.sofa_score_target_id,
        },
      });

      if (existing) {
        throw new ConflictException('Already in favorites');
      }

      const favorite = queryRunner.manager.create(Favorite, {
        user_id: userId,
        target_type: dto.target_type,
        sofa_score_target_id: dto.sofa_score_target_id,
        target_name: dto.target_name,
      });

      await queryRunner.manager.save(favorite);
      await queryRunner.commitTransaction();

      this.logger.info(
        `Favorite added for user ${userId}: ${dto.target_type} ${dto.sofa_score_target_id}`,
      );
      return favorite;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error creating favorite', error);
      throw new InternalServerErrorException('Failed to add favorite');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!favorite) {
      throw new NotFoundException(
        'Favorite not found or does not belong to the user',
      );
    }

    await this.favoriteRepository.remove(favorite);
    this.logger.info(`Favorite removed for user ${userId}: ${id}`);
  }
}
