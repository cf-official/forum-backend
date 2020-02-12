import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
        return false;
    }

    request.user = await this.validateToken(request.headers.authorization);

    return true;

  }

  async validateToken(token: string) {

      if (token.split(' ')[0] !== 'Bearer') {
          throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
      }

      const bearerToken = token.split(' ')[1];

      try {
          const decoded = jwt.verify(bearerToken, process.env.SECRET);
          return decoded;
      } catch (err) {
          throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
      }

  }

}
