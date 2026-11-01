import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtClaims {
  sub?: unknown;
}

interface AuthenticatedRequest {
  headers: { authorization?: string | string[] };
  user?: { id: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const [scheme, token, ...extraParts] =
      typeof authorization === 'string' ? authorization.split(' ') : [];

    if (scheme?.toLowerCase() !== 'bearer' || !token || extraParts.length > 0) {
      throw new UnauthorizedException('A valid bearer token is required');
    }

    try {
      const claims = await this.jwtService.verifyAsync<JwtClaims>(token);
      if (typeof claims.sub !== 'string' || claims.sub.length === 0) {
        throw new UnauthorizedException('A valid bearer token is required');
      }
      request.user = { id: claims.sub };
      return true;
    } catch {
      throw new UnauthorizedException('A valid bearer token is required');
    }
  }
}
