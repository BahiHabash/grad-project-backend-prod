import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'identifier',
      passwordField: 'password',
    });
  }

  /** Validate user credentials and attach the user to the request object
   * @param req - The express request object
   */
  async validate(identifier: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(identifier, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Passport attaches this return value to req.user
    return user;
  }
}
