import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminRoleGuard } from './admin-role.guard';

describe('AdminRoleGuard', () => {
  it('allows an authenticated user whose current database role is admin', async () => {
    const guard = new AdminRoleGuard({
      findOneBy: vi.fn().mockResolvedValue({ role: 'admin' }),
    } as never);

    await expect(
      guard.canActivate(createContext({ user: { id: 'admin-1' } })),
    ).resolves.toBe(true);
  });

  it('rejects non-admin users even if they are authenticated', async () => {
    const guard = new AdminRoleGuard({
      findOneBy: vi.fn().mockResolvedValue({ role: 'user' }),
    } as never);

    await expect(
      guard.canActivate(createContext({ user: { id: 'user-1' } })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects missing or deleted authenticated users', async () => {
    const guard = new AdminRoleGuard({
      findOneBy: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(guard.canActivate(createContext({}))).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(createContext({ user: { id: 'deleted-user' } })),
    ).rejects.toThrow(UnauthorizedException);
  });
});

function createContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}
