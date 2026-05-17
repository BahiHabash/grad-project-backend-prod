import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { FavoriteService } from './favorite.service';
import { UserController } from './user.controller';
import { FavoriteController } from './favorite.controller';
import { User } from './entities/user.entity';
import { Favorite } from './entities/favorite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRepository } from './repositories/user.repository';
import { FavoriteRepository } from './repositories/favorite.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Favorite])],
  controllers: [UserController, FavoriteController],
  providers: [UserService, FavoriteService, UserRepository, FavoriteRepository],
  exports: [UserService, FavoriteService, UserRepository, FavoriteRepository],
})
export class UserModule {}
