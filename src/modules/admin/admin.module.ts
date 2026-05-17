import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';

@Module({
  imports: [UserModule, ClubModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
