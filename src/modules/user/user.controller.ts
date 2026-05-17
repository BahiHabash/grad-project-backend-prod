import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResDto } from './dto/user-profile-res.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/constants/token-payload.type';
import { ValidationGuard } from '../../common/guards/validation.guard';
import { SysRoles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../../common/enums/system-role.enum';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Current user profile retrieved successfully',
    type: UserProfileResDto,
  })
  async getMyProfile(
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<UserProfileResDto> {
    const userProfile = await this.userService.getProfile(user.id);
    return plainToInstance(UserProfileResDto, userProfile, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('me')
  @UseGuards(ValidationGuard(UpdateUserDto))
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserProfileResDto })
  @ResponseMessage('Profile updated successfully')
  async updateMyProfile(
    @CurrentUser() user: AccessTokenPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(user.id, updateUserDto);
  }

  @Patch('me/deactivate')
  @ApiOperation({ summary: 'Deactivate your account' })
  @ApiOkResponse({ description: 'Account deactivated' })
  @ResponseMessage('Account deactivated')
  async deactivateAccount(
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<void> {
    await this.userService.deactivateAccount(user.id);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Soft delete your account' })
  @ApiOkResponse({ description: 'Account soft deleted' })
  @ResponseMessage('Account deleted')
  async softDeleteAccount(
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<void> {
    await this.userService.softDeleteAccount(user.id);
  }

  @Delete('me/with-club')
  @ApiOperation({ summary: 'Soft delete your account and your club' })
  @ApiOkResponse({ description: 'Account and club soft deleted' })
  @ResponseMessage('Account and club deleted')
  async softDeleteAccountAndClub(
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<void> {
    await this.userService.softDeleteAccountAndClub(user.id);
  }

  @Get(':id')
  @SysRoles(SystemRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get user by Id' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ type: UserProfileResDto })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOneByIdOrFail(id);
  }
}
