import { Module } from '@nestjs/common';
import { PrematchService } from './prematch.service';
import { PrematchController } from './prematch.controller';

@Module({
  controllers: [PrematchController],
  providers: [PrematchService],
})
export class PrematchModule {}
