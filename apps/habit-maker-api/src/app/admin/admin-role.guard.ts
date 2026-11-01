import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/user.entity';

interface AuthenticatedRequest {
  user?: { id: string };
}

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('A valid bearer token is required');
    }

    const user = await this.users.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException(
        'The authenticated user no longer exists',
      );
    }
    if (user.role !== 'admin') {
      throw new ForbiddenException('Administrator access is required');
    }

    return true;
  }
}
