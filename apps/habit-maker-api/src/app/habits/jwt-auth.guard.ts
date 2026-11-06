import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '../auth/session.service';

interface JwtClaims {
  sub?: unknown;
  jti?: unknown;
  exp?: unknown;
}

interface AuthenticatedRequest {
  headers: { authorization?: string | string[] };
  user?: { id: string; sessionId: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessions: SessionService,
  ) {}

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
      if (
        typeof claims.sub !== 'string' ||
        claims.sub.length === 0 ||
        typeof claims.jti !== 'string' ||
        claims.jti.length === 0 ||
        typeof claims.exp !== 'number'
      ) {
        throw new UnauthorizedException('A valid bearer token is required');
      }
      const session = await this.sessions.findActiveSession(
        claims.jti,
        claims.sub,
      );
      if (!session) {
        throw new UnauthorizedException('A valid bearer token is required');
      }
      await this.sessions.touch(session);
      request.user = { id: claims.sub, sessionId: claims.jti };
      return true;
    } catch {
      throw new UnauthorizedException('A valid bearer token is required');
    }
  }
}
