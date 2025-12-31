import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ENDPOINT_KEY } from '../../../common/decorators/public-endpoint.decorator';

/**
 * Guard that extends the Passport JWT Strategy.
 * It checks for public metadata before triggering the authentication logic.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Determines if the request can proceed.
   * If the route is marked as public, it returns true immediately.
   * Otherwise, it invokes the Passport JWT validation.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ENDPOINT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    // super.canActivate returns boolean | Promise<boolean> | Observable<boolean>
    return (await super.canActivate(context)) as boolean;
  }

  /**
   * Customizes the error response when authentication fails.
   */
  handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (err || !user) {
      // info contains specific JWT errors (like "jwt expired")
      throw new UnauthorizedException('Invalid or Expired auth token.');
    }
    return user;
  }
}
