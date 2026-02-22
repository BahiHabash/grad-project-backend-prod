import { Controller, Get } from '@nestjs/common';
import { PrematchService } from './prematch.service';
import { PreMatchResDto } from './dto/prematch-dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('pre-match')
export class PrematchController {
  constructor(private readonly prematchService: PrematchService) {}

  @ApiOperation({ summary: 'Get pre-match data' })
  @ApiResponse({
    status: 200,
    description: 'Pre-match data retrieved and validated successfully.',
    type: PreMatchResDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or Expired auth token.' })
  @ApiResponse({
    status: 502,
    description: 'External API is unreachable or returned invalid data.',
  })
  @Get()
  async findAll(): Promise<PreMatchResDto> {
    return await this.prematchService.preMatchData();
  }
}
