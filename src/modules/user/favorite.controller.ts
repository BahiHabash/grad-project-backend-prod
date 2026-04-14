import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteResDto } from './dto/favorite-res.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/constants/token-payload.type';
import { ValidationGuard } from '../../common/guards/validation.guard';
import { FavoriteTargetType } from '../../common/enums/favorite-target-type.enum';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user favorites' })
  @ApiQuery({
    name: 'type',
    enum: FavoriteTargetType,
    required: false,
    description: 'Filter favorites by target type',
  })
  @ApiOkResponse({ type: [FavoriteResDto] })
  async getMyFavorites(
    @CurrentUser() user: AccessTokenPayload,
    @Query('type') type?: FavoriteTargetType,
  ) {
    return this.favoriteService.findAllByUser(user.id, type);
  }

  @Post()
  @UseGuards(ValidationGuard(CreateFavoriteDto))
  @ApiOperation({ summary: 'Add a favorite' })
  @ApiCreatedResponse({ type: FavoriteResDto })
  @ApiConflictResponse({ description: 'Already in favorites' })
  @ResponseMessage('Added to favorites')
  async addFavorite(
    @CurrentUser() user: AccessTokenPayload,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    return this.favoriteService.create(user.id, createFavoriteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a favorite' })
  @ApiNotFoundResponse({ description: 'Favorite not found' })
  @ResponseMessage('Removed from favorites')
  async removeFavorite(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.favoriteService.remove(user.id, id);
    return null;
  }
}
