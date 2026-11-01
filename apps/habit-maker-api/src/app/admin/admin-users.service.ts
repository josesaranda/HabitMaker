import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../auth/user.entity';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<AdminUser[]> {
    const users = await this.users.find({ order: { email: 'ASC' } });
    return users.map(({ id, email, role }) => ({ id, email, role }));
  }
}
