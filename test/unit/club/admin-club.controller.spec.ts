/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminClubController } from '../../../src/modules/club/controllers/admin-club.controller';
import { ClubService } from '../../../src/modules/club/club.service';
import { ClubStatus } from '../../../src/modules/club/constants/club-status.enum';

describe('AdminClubController', () => {
  let controller: AdminClubController;
  let service: jest.Mocked<ClubService>;

  beforeEach(async () => {
    const mockClubService = {
      listClubs: jest.fn(),
      updateClubStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminClubController],
      providers: [{ provide: ClubService, useValue: mockClubService }],
    }).compile();

    controller = module.get<AdminClubController>(AdminClubController);
    service = module.get(ClubService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listClubs', () => {
    it('should return a list of paginated clubs', async () => {
      const query = { name: 'FC', page: 1, limit: 10 };
      const expectedResponse = {
        clubs: [{ id: 'club-uuid', name: 'FC' }],
        total: 1,
        page: 1,
        limit: 10,
      } as any;
      service.listClubs.mockResolvedValue(expectedResponse);

      const result = await controller.listClubs(query);

      expect(result).toEqual(expectedResponse);
      expect(service.listClubs).toHaveBeenCalledWith(query);
    });
  });

  describe('updateClubStatus', () => {
    it('should call updateClubStatus on service', async () => {
      const id = 'club-uuid';
      const dto = { status: ClubStatus.ACTIVE };
      service.updateClubStatus.mockResolvedValue(undefined);

      await controller.updateClubStatus(id, dto);

      expect(service.updateClubStatus).toHaveBeenCalledWith(id, dto);
    });
  });
});
