import { Controller, Get } from '@nestjs/common';
import { PrematchService } from './prematch.service';
import { Public } from 'src/common/decorators/public-endpoint.decorator';

@Controller('prematch')
export class PrematchController {
  constructor(private readonly prematchService: PrematchService) {}

  @Public()
  @Get()
  async findAll() {
    return await this.prematchService.preMatchData();
  }
}
