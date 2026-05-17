import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SystemRole } from '../../common/enums/system-role.enum';
import { PromoteUserDto } from './dtos/promote-user.dto';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';
import { ClaimSearchQueryDto } from './dtos/claim-search-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../user/repositories/user.repository';
import { ClaimRepository } from '../club/repositories/claim.repository';
import { ClubRepository } from '../club/repositories/club.repository';
import { Claim } from '../club/entities/claim.entity';
import { Club } from '../club/entities/club.entity';
import type { AccessTokenPayload } from '../auth/constants/token-payload.type';
import { SecurityEvents } from '../../common/events/security.events';
import { UserService } from '../user/user.service';
import { UserSearchQueryDto } from '../user/dto/user-search.dto';
import { updateSecurityActionTime } from '../auth/helpers/security.helper';

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
    private readonly userService: UserService,
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
        this.eventEmitter.emit(SecurityEvents.ADMIN_SECURITY_VIOLATION, {
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
      last_security_action_at: updateSecurityActionTime(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${targetUserId} not found.`);
    }

    // 3. Emit success event for audit logging/notifications
    this.eventEmitter.emit(SecurityEvents.ADMIN_USER_PROMOTED, {
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
      last_security_action_at: updateSecurityActionTime(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${targetUserId} not found.`);
    }

    this.eventEmitter.emit(SecurityEvents.ADMIN_USER_STATUS_UPDATED, {
      targetUserId,
      newStatus: dto.status,
    });
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
   * @param dto - Pagination parameters and name filter.
   */
  async searchClubs(dto: ClaimSearchQueryDto): Promise<{
    clubs: Club[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (dto.page - 1) * dto.limit;

    const queryBuilder = this.clubRepository.internalRepo
      .createQueryBuilder('club')
      .select(['club.id', 'club.name', 'club.status', 'club.created_at']);

    const [clubs, total] = await queryBuilder
      .skip(skip)
      .take(dto.limit)
      .orderBy('club.created_at', 'DESC')
      .getManyAndCount();

    return {
      clubs,
      total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  async searchUsers(query: UserSearchQueryDto) {
    return this.userService.searchUsers(query);
  }
}
