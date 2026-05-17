import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DataSource } from 'typeorm';
import { AccountStatus } from '../../common/enums/account-status.enum';
import { MemberRole } from '../../common/enums/member-role.enum';
import { PinoLogger } from 'nestjs-pino';
import { ClubStatus } from '../club/constants/club-status.enum';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly logger: PinoLogger,
  ) {}

  // ==========================================
  // Public API (called by controllers)
  // ==========================================

  /**
   * Gets the profile of the current user.
   * @param userId The ID of the user to get the profile for.
   * @returns The profile of the current user.
   * @throws NotFoundException if the user is not found.
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.internalRepo.findOne({
      where: { id: userId, status: AccountStatus.ACTIVE },
      relations: ['club'],
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        is_verified: true,
        status: true,
        club_id: true,
        member_role: true,
        system_role: true,
        profile_image_url: true,
        club: {
          id: true,
          sofa_score_club_id: true,
          name: true,
          logo_url: true,
          status: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  /**
   * Updates the profile of the current user.
   * @param userId The ID of the user to update.
   * @param dto The data to update the user profile with.
   * @returns The updated user profile.
   * @throws NotFoundException if the user is not found.
   */
  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneByIdOrFail(userId);

    // Update user profile
    if (dto.first_name) user.first_name = dto.first_name;
    if (dto.last_name) user.last_name = dto.last_name;
    if (dto.profile_image_url) user.profile_image_url = dto.profile_image_url;

    return await this.userRepository.internalRepo.save(user);
  }

  /**
   * Deactivates the account of the current user.
   * @param userId The ID of the user to deactivate.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the user is an owner of an active club.
   */
  async deactivateAccount(userId: string): Promise<void> {
    const user = await this.userRepository.internalRepo.findOne({
      where: { id: userId, status: AccountStatus.ACTIVE },
      relations: ['club'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Owner cannot deactivate their account, transfer ownership first or delete the club.
    if (
      user.club?.owner_id === user.id &&
      user.member_role === MemberRole.OWNER &&
      user.club?.status === ClubStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Owners cannot deactivate their accounts, transfer ownership first or delete the club.',
      );
    }

    user.status = AccountStatus.DEACTIVATED;
    user.last_security_action_at = new Date();

    await this.userRepository.internalRepo.save(user);
    this.logger.info(`User ${userId} deactivated their account`);
  }

  /**
   * Soft deletes the account of the current user.
   * @param userId The ID of the user to soft delete.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the user is an owner of an active club.
   */
  async softDeleteAccount(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['club'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Owner cannot delete their account, transfer ownership first or delete the club.
      if (
        user.club?.owner_id === user.id &&
        user.member_role === MemberRole.OWNER &&
        user.club?.status === ClubStatus.ACTIVE
      ) {
        throw new BadRequestException(
          'Owners cannot delete their accounts, transfer ownership first or delete the club.',
        );
      }

      // update club membership so they leave the club upon soft delete
      user.club_id = null;
      user.member_role = null;
      user.last_security_action_at = new Date();

      // We maintain the user row but change status and deleted_at
      user.status = AccountStatus.SOFT_DELETED;

      // TypeORM soft remove
      await queryRunner.manager.save(user);
      await queryRunner.manager.softRemove(user);

      await queryRunner.commitTransaction();
      this.logger.info(`User ${userId} soft-deleted their account`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error soft-deleting user ${userId}`, error);
      throw new InternalServerErrorException('Failed to delete account');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Soft deletes the account of the current user and their club.
   * @param userId The ID of the user to soft delete.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the user is not an owner or if the club has other active members.
   */
  async softDeleteAccountAndClub(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['club', 'club.users'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (
        user.club?.owner_id !== user.id ||
        user.member_role !== MemberRole.OWNER
      ) {
        throw new BadRequestException(
          'Only the club owner can delete the club along with their account.',
        );
      }

      const club = user.club;

      // Ensure no other members exist, or we require them to be removed first
      const otherStaff = club.users.filter(
        (u) => u.id !== user.id && u.status !== AccountStatus.SOFT_DELETED,
      );

      if (otherStaff.length > 0) {
        throw new BadRequestException(
          'Cannot delete club with active staff. Please remove all staff first or delegate ownership.',
        );
      }

      // Soft delete club
      club.status = ClubStatus.SOFT_DELETED;
      await queryRunner.manager.save(club);
      await queryRunner.manager.softRemove(club);

      // Soft delete user and remove from club context
      user.status = AccountStatus.SOFT_DELETED;
      user.club_id = null;
      user.member_role = null;

      await queryRunner.manager.save(user);
      await queryRunner.manager.softRemove(user);

      await queryRunner.commitTransaction();
      this.logger.info(
        `User ${userId} soft-deleted their account and club ${club.id}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error soft-deleting user ${userId} and club`, error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete account and club',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // Internal API (called by other modules)
  // ==========================================

  /**
   * Finds a user by ID and returns null if not found.
   * @param id The ID of the user to find.
   * @returns The user with the specified ID or null if not found.
   */
  async findOneById(id: string): Promise<User | null> {
    return await this.userRepository.findNotDeletedById(id);
  }

  /**
   * Finds a user by email and returns null if not found.
   * @param email The email of the user to find.
   * @returns The user with the specified email or null if not found.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findActiveByEmail(email);
  }

  /**
   * Finds a user by ID and throws an exception if not found.
   * @param id The ID of the user to find.
   * @returns The user with the specified ID.
   * @throws NotFoundException if the user is not found.
   */
  async findOneByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findActiveById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Updates the club membership of a user.
   * @param userId The ID of the user to update.
   * @param clubId The ID of the club to assign to the user.
   * @param role The role of the user in the club.
   * @throws NotFoundException if the user is not found.
   * @throws InternalServerErrorException if the club membership update fails.
   */
  async updateClubMembership(
    userId: string,
    clubId: string | null,
    role: MemberRole | null,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.club_id = clubId; // using any for nullable FK assign if stricter TS complains
      user.member_role = role;

      if (clubId === null) {
        user.club_id = null;
        user.member_role = null;
      } else {
        user.club_id = clubId;
        user.member_role = role;
      }

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      this.logger.info(
        `Updated club membership for user ${userId} to club ${clubId} with role ${role}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error updating club membership for user ${userId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update club membership',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
