import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AccessTokenPayload } from '../../modules/auth/constants/token-payload.type';
import type { RequestWithUser } from '../interfaces/Request.interface';

/**
 * Get the current user from the request.
 * @param data - The key of the user property to get or an array of keys or undefined to get the whole user.
 * @example
 * ```typescript
 * getCurrentUser(@CurrentUser() user: AccessTokenPayload) {}
 * getCurrentUserId(@CurrentUser('id') id: string) {}
 * getCurrentUserIds(@CurrentUser(['sys_role', 'club_id']) {}
 * ```
 * @param ctx - The execution context.
 * @returns The current user or the requested property or an empty object if the user is not found.
 */
export const CurrentUser = createParamDecorator(
  (
    data: (keyof AccessTokenPayload)[] | keyof AccessTokenPayload | undefined,
    ctx: ExecutionContext,
  ):
    | Partial<AccessTokenPayload>
    | AccessTokenPayload[keyof AccessTokenPayload] => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Safety fallback if the route is public and no user is attached
    if (!user) {
      return {};
    }

    if (typeof data === 'string') {
      return user[data] || null;
    }

    if (Array.isArray(data)) {
      return data.reduce(
        (result, key) => {
          result[key] = user[key];
          return result ?? null;
        },
        {} as Record<string, any>,
      );
    }

    return user;
  },
);
