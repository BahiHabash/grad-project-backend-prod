import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../../src/modules/admin/admin.controller';
import { AdminService } from '../../../src/modules/admin/admin.service';
import { PromoteUserDto } from '../../../src/modules/admin/dtos/promote-user.dto';
import { UpdateUserStatusDto } from '../../../src/modules/admin/dtos/update-user-status.dto';
import { UserSearchQueryDto } from '../../../src/modules/admin/dtos/user-search-query.dto';
import { ClaimSearchQueryDto } from '../../../src/modules/admin/dtos/claim-search-query.dto';
import { SystemRole } from '../../../src/common/enums/system-role.enum';
import { AccountStatus } from '../../../src/common/enums/account-status.enum';
import type { AccessTokenPayload } from '../../../src/modules/auth/constants/token-payload.type';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: jest.Mocked<AdminService>;

  beforeEach(async () => {
    const mockAdminService = {
      promoteUser: jest.fn(),
      updateUserStatus: jest.fn(),
      searchUsers: jest.fn(),
      searchClaims: jest.fn(),
      searchClubs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('promoteUser', () => {
    it('should call adminService.promoteUser with correct arguments', async () => {
      const id = 'test-uuid';
      const requester = { id: 'admin-uuid' } as AccessTokenPayload;
      const dto: PromoteUserDto = { role: SystemRole.ADMIN };

      await controller.promoteUser(id, requester, dto);

      expect(adminService.promoteUser).toHaveBeenCalledWith(requester, id, dto);
    });
  });

  describe('updateUserStatus', () => {
    it('should call adminService.updateUserStatus with correct arguments', async () => {
      const id = 'test-uuid';
      const dto: UpdateUserStatusDto = { status: AccountStatus.BANNED };

      await controller.updateUserStatus(id, dto);

      expect(adminService.updateUserStatus).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('searchUsers', () => {
    it('should call adminService.searchUsers with correct arguments', async () => {
      const query: UserSearchQueryDto = { page: 1, limit: 10 };
      adminService.searchUsers.mockResolvedValue({ users: [], total: 0, page: 1, limit: 10 });

      const result = await controller.searchUsers(query);

      expect(adminService.searchUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual({ users: [], total: 0, page: 1, limit: 10 });
    });
  });

  describe('searchClaims', () => {
    it('should call adminService.searchClaims with correct arguments', async () => {
      const query: ClaimSearchQueryDto = { page: 1, limit: 10 };
      adminService.searchClaims.mockResolvedValue({ claims: [], total: 0, page: 1, limit: 10 });

      const result = await controller.searchClaims(query);

      expect(adminService.searchClaims).toHaveBeenCalledWith(query);
      expect(result).toEqual({ claims: [], total: 0, page: 1, limit: 10 });
    });
  });

  describe('searchClubs', () => {
    it('should call adminService.searchClubs with correct arguments', async () => {
      adminService.searchClubs.mockResolvedValue({ clubs: [], total: 0, page: 1, limit: 10 });

      const result = await controller.searchClubs(1, 10, 'Test');

      expect(adminService.searchClubs).toHaveBeenCalledWith(1, 10, 'Test');
      expect(result).toEqual({ clubs: [], total: 0, page: 1, limit: 10 });
    });
  });
});
