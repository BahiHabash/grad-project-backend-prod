import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Club } from './entities/club.entity';
import { User } from '../user/entities/user.entity';

import { ClubRepository } from './repositories/club.repository';
import { UserRepository } from '../user/repositories/user.repository';

// Controllers
import { ClubController } from './controllers/club.controller';
import { AdminClubController } from './controllers/admin-club.controller';

// Service
import { ClubService } from './club.service';
import { UserModule } from '../user/user.module';

/**
 * ClubModule owns all club-related domain logic:
 * - Club governance (view, leave, succession)
 * - Admin oversight (list clubs, update club status)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Club, User]),
    forwardRef(() => UserModule),
  ],
  controllers: [ClubController, AdminClubController],
  providers: [ClubRepository, UserRepository, ClubService],
  exports: [ClubRepository, ClubService],
})
export class ClubModule {}
