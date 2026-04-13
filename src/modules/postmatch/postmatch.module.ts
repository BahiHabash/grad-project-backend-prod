import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostmatchController } from './postmatch.controller';
import { PostmatchService } from './postmatch.service';
import { AiModelClient } from './providers/ai-model.client';
import { LlmClient } from './providers/llm/llm.client';
import { PostMatchReport } from './entities/postmatch-report.entity';

/**
 * Fully isolated module for post-match analysis.
 *
 * Dependencies:
 *   - TypeOrmModule (PostMatchReport entity — own table)
 *   - Axios (used directly by AiModelClient for AI microservice calls)
 *
 * Does NOT import any other feature module.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PostMatchReport])],
  controllers: [PostmatchController],
  providers: [PostmatchService, AiModelClient, LlmClient],
})
export class PostmatchModule {}
