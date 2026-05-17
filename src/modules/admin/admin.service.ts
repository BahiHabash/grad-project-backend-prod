import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { SystemRole } from '../../common/enums/system-role.enum';
import { PromoteUserDto } from './dtos/promote-user.dto';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';
import { UserSearchQueryDto } from './dtos/user-search-query.dto';
import { ClaimSearchQueryDto } from './dtos/claim-search-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../user/repositories/user.repository';
import { ClaimRepository } from '../club/repositories/claim.repository';
import { ClubRepository } from '../club/repositories/club.repository';
import { Claim } from '../club/entities/claim.entity';
import { Club } from '../club/entities/club.entity';
import type { AccessTokenPayload } from '../auth/constants/token-payload.type';

/**
 * Service handling administrative operations including user management,
 * role promotion, and system-wide search.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly claimRepository: ClaimRepository,
    private readonly clubRepository: ClubRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Promotes a user to a new system role based on the requester's hierarchy.
   *
   * @param requester - The authenticated user performing the promotion.
   * @param targetUserId - The UUID of the user to be promoted.
   * @param dto - Data containing the new role.
   * @throws ForbiddenException if the promotion violates the role hierarchy.
   * @throws NotFoundException if the target user does not exist.
   */
  async promoteUser(
    requester: AccessTokenPayload,
    targetUserId: string,
    dto: PromoteUserDto,
  ): Promise<void> {
    // 1. Hierarchy Validation
    if (requester.sys_role === SystemRole.ADMIN) {
      if (
        dto.role === SystemRole.ADMIN ||
        dto.role === SystemRole.SUPER_ADMIN
      ) {
        // Emit security violation event to notify SUPER_ADMINs
        this.eventEmitter.emit('admin.security.violation', {
          requesterId: requester.id,
          targetUserId,
          attemptedRole: dto.role,
          action: 'ROLE_PROMOTION_OVERREACH',
        });

        throw new ForbiddenException(
          'Admins can only promote users to REVIEWER role. Promotion to ADMIN or SUPER_ADMIN is restricted to Super Admins.',
        );
      }
    }

    // 2. Perform raw update to bypass class-validator hooks on the entity
    const result = await this.userRepository.internalRepo.update(targetUserId, {
      system_role: dto.role,
      last_security_action_at: new Date(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${targetUserId} not found.`);
    }

    // 3. Emit success event for audit logging/notifications
    this.eventEmitter.emit('admin.user.promoted', {
      targetUserId,
      newRole: dto.role,
      adminId: requester.id,
    });
  }

  /**
   * Updates a user's account status (e.g., BANNED, ACTIVE).
   *
   * @param targetUserId - The UUID of the user to update.
   * @param dto - Data containing the new status.
   * @throws NotFoundException if the user does not exist.
   */
  async updateUserStatus(
    targetUserId: string,
    dto: UpdateUserStatusDto,
  ): Promise<void> {
    const result = await this.userRepository.internalRepo.update(targetUserId, {
      status: dto.status,
      last_security_action_at: new Date(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${targetUserId} not found.`);
    }

    this.eventEmitter.emit('admin.user.status_updated', {
      targetUserId,
      newStatus: dto.status,
    });
  }

  /**
   * Searches for users based on email, status, and role with pagination.
   *
   * @param query - The search filters and pagination parameters.
   * @returns A paginated list of users and the total count.
   */
  async searchUsers(query: UserSearchQueryDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.internalRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.first_name',
        'user.last_name',
        'user.status',
        'user.system_role',
        'user.member_role',
        'user.created_at',
      ]);

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        let searchValue = value;
        let conditionType = 'eq';
        const likeSearchFields = ['email', 'username', 'club_name'];

        if (likeSearchFields.includes(key)) {
          searchValue = `%${value}%`;
          conditionType = 'ilike';
        }

        queryBuilder.andWhere(`user.${key} ${conditionType} :${key}`, {
          [key]: searchValue,
        });
      }
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Searches for club ownership claims based on status with pagination.
   *
   * @param query - The search filters and pagination parameters.
   */
  async searchClaims(query: ClaimSearchQueryDto): Promise<{
    claims: Claim[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.claimRepository.internalRepo
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .select([
        'claim.id',
        'claim.club_name',
        'claim.sofa_score_team_id',
        'claim.status',
        'claim.created_at',
        'user.id',
        'user.email',
      ]);

    if (status) {
      queryBuilder.andWhere('claim.status = :status', { status });
    }

    const [claims, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('claim.created_at', 'DESC')
      .getManyAndCount();

    return {
      claims,
      total,
      page,
      limit,
    };
  }

  /**
   * Searches for clubs (Teams foundation) with pagination.
   *
   * @param query - Pagination parameters and name filter.
   */
  async searchClubs(
    page: number = 1,
    limit: number = 10,
    name?: string,
  ): Promise<{
    clubs: Club[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.clubRepository.internalRepo
      .createQueryBuilder('club')
      .select(['club.id', 'club.name', 'club.status', 'club.created_at']);

    if (name) {
      queryBuilder.andWhere('club.name ILIKE :name', { name: `%${name}%` });
    }

    const [clubs, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('club.created_at', 'DESC')
      .getManyAndCount();

    return {
      clubs,
      total,
      page,
      limit,
    };
  }
}
