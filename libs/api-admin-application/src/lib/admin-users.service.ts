import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@habit-maker/api-auth-infrastructure';
import { AdminUser } from '@habit-maker/api-admin-domain';

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
