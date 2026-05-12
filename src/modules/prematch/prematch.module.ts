import { Module } from '@nestjs/common';
import { PrematchService } from './prematch.service';
import { PrematchController } from './prematch.controller';
import { SofaScoreProvider } from './providers/sofa-score.provider';
import { PreMatchAnalysisEntity } from './entities/pre-match-analysis.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreMatchProvider } from './providers/ai-client-provider';

@Module({
  imports: [TypeOrmModule.forFeature([PreMatchAnalysisEntity])],
  controllers: [PrematchController],
  providers: [PrematchService, SofaScoreProvider, PreMatchProvider]
})
export class PrematchModule {}
