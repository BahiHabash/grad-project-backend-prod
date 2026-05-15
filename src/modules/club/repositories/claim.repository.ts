import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class ClaimRepository extends BaseRepository<Claim> {
  constructor(
    @InjectRepository(Claim)
    protected readonly repo: Repository<Claim>,
  ) {
    super(repo);
  }

  get internalRepo(): Repository<Claim> {
    return this.repo;
  }
}
