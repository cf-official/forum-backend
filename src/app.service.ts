import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): object {
    return {
      version: '0.0.1',
      stable: false
    };
  }
}
