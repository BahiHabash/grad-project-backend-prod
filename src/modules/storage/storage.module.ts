import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageFile } from './entities/storage-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StorageFile])],
  exports: [TypeOrmModule],
})
export class StorageModule {}
