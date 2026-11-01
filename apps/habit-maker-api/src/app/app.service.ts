import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  ping(): { message: string } {
    return { message: 'pong' };
  }

  health(): { status: string } {
    return { status: 'ok' };
  }
}
