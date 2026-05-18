/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { ClubController } from '../../../src/modules/club/controllers/club.controller';
import { ClubService } from '../../../src/modules/club/club.service';
import { ClubResponseDto } from '../../../src/modules/club/dto/club-governance.dto';
import { ClubStatus } from '../../../src/modules/club/constants/club-status.enum';

describe('ClubController', () => {
  let controller: ClubController;
  let service: jest.Mocked<ClubService>;

  beforeEach(async () => {
    const mockClubService = {
      getMyClub: jest.fn(),
      leaveClub: jest.fn(),
      succession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubController],
      providers: [{ provide: ClubService, useValue: mockClubService }],
    }).compile();

    controller = module.get<ClubController>(ClubController);
    service = module.get(ClubService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyClub', () => {
    it('should return club details on success', async () => {
      const user = { id: 'user-uuid', club_id: 'club-uuid' } as any;
      const expectedResponse: ClubResponseDto = {
        id: 'club-uuid',
        name: 'Mock FC',
        description: 'Mock Description',
        sofa_score_club_id: '123',
        logo_url: 'logo.png',
        owner_id: 'user-uuid',
        status: ClubStatus.ACTIVE,
        created_at: new Date(),
      };
      service.getMyClub.mockResolvedValue(expectedResponse);

      const result = await controller.getMyClub(user);

      expect(result).toEqual(expectedResponse);
      expect(service.getMyClub).toHaveBeenCalledWith(user);
    });
  });

  describe('leaveClub', () => {
    it('should call service leaveClub on success', async () => {
      const user = { id: 'user-uuid', club_id: 'club-uuid' } as any;
      service.leaveClub.mockResolvedValue(undefined);

      await controller.leaveClub(user);

      expect(service.leaveClub).toHaveBeenCalledWith(user);
    });
  });

  describe('succession', () => {
    it('should call service succession on success', async () => {
      const user = { id: 'user-uuid', club_id: 'club-uuid' } as any;
      const dto = { targetUserId: 'target-user-uuid' };
      service.succession.mockResolvedValue(undefined);

      await controller.succession(user, dto);

      expect(service.succession).toHaveBeenCalledWith(user, 'target-user-uuid');
    });
  });
});
