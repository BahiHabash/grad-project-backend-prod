import type { MemberRole } from '../../../common/enums/member-role.enum';
import type { SystemRole } from '../../../common/enums/system-role.enum';

export type AccessTokenPayload = {
  id: string;
  username: string;
  status: string;
  sys_role: SystemRole;
  club_id: string | null;
  mem_role: MemberRole;
};
