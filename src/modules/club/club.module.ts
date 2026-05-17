import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { Club } from './entities/club.entity';
import { Claim } from './entities/claim.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubRepository } from './repositories/club.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Claim])],
  controllers: [ClubController],
  providers: [ClubService, ClubRepository],
  exports: [ClubService, ClubRepository],
})
export class ClubModule {}
