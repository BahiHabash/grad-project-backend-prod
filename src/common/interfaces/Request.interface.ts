import type { AccessTokenPayload } from '../../modules/auth/constants/token-payload.type';

export interface RequestWithUser extends Request {
  user: AccessTokenPayload;
}
