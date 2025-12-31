import type { MemberRole } from '../../member/constants/member-role.enum';
import type { SystemRole } from '../../user/constants/system-role.enum';

export type AccessTokenPayload = {
  id: string;
  username: string;
  status: string;
  sys_role: SystemRole;
  mem_role: MemberRole | undefined;
};
