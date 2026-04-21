import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostmatchController } from './postmatch.controller';
import { PostmatchService } from './postmatch.service';
import { AiModelClient } from './providers/ai-model.client';
import { LlmClient } from './providers/llm/llm.client';
import { PostMatchReport } from './entities/postmatch-report.entity';
import { Club } from '../club/entities/club.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostMatchReport, Club])],
  controllers: [PostmatchController],
  providers: [PostmatchService, AiModelClient, LlmClient],
})
export class PostmatchModule {}
