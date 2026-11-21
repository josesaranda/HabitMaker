import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  const session = {
    id: 'session-1',
    userId: 'user-1',
    lastUsedAt: String(Date.now()),
  };
  const sessions = {
    findActiveSession: vi.fn().mockResolvedValue(session),
    touch: vi.fn().mockResolvedValue(undefined),
  };
  const guard = new JwtAuthGuard(jwtService, sessions as never);

  it('extracts the user and active session from a bearer token', async () => {
    const token = await jwtService.signAsync(
      { sub: 'user-1' },
      { jwtid: 'session-1', expiresIn: '1h' },
    );
    const request: {
      headers: { authorization: string };
      user?: { id: string; sessionId: string };
    } = {
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1', sessionId: 'session-1' });
    expect(sessions.findActiveSession).toHaveBeenCalledWith(
      'session-1',
      'user-1',
    );
    expect(sessions.touch).toHaveBeenCalledWith(session);
  });

  it('rejects a validly signed token without an active server-side session', async () => {
    sessions.findActiveSession.mockResolvedValueOnce(null);
    const token = await jwtService.signAsync(
      { sub: 'user-1' },
      { jwtid: 'revoked-session', expiresIn: '1h' },
    );

    await expect(
      guard.canActivate(
        createContext({ headers: { authorization: `Bearer ${token}` } }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects requests without a valid bearer token', async () => {
    const request = { headers: {} };

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

function createContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}
