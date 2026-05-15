import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { AccountStatus } from '../../../common/enums/account-status.enum';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    protected readonly repo: Repository<User>,
  ) {
    super(repo);
  }

  get internalRepo(): Repository<User> {
    return this.repo;
  }

  /**
   * Finds a user by ID, ensuring they are ACTIVE.
   */
  async findActiveById(
    id: string,
    relations: string[] = [],
  ): Promise<User | null> {
    return this.repo.findOne({
      where: { id, status: AccountStatus.ACTIVE },
      relations,
    });
  }

  /**
   * Finds a user by Email, ensuring they are ACTIVE.
   */
  async findActiveByEmail(
    email: string,
    relations: string[] = [],
  ): Promise<User | null> {
    return this.repo.findOne({
      where: { email, status: AccountStatus.ACTIVE },
      relations,
    });
  }

  /**
   * Finds a user by ID with any of the allowed statuses.
   */
  async findByIdWithStatus(
    id: string,
    statuses: AccountStatus[],
    relations: string[] = [],
  ): Promise<User | null> {
    return this.repo.findOne({
      where: { id, status: In(statuses) },
      relations,
    });
  }

  /**
   * Excludes SOFT_DELETED accounts. Useful for generic queries where we want
   * both ACTIVE and DEACTIVATED but not SOFT_DELETED.
   */
  async findNotDeletedById(
    id: string,
    relations: string[] = [],
  ): Promise<User | null> {
    const user = await this.repo.findOne({
      where: { id },
      relations,
    });

    if (user && user.status !== AccountStatus.SOFT_DELETED) {
      return user;
    }
    return null;
  }
}
