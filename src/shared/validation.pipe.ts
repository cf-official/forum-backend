import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {

  async transform(value: any, { metatype }: ArgumentMetadata) {

    if (value instanceof Object && this.isEmpty(value)) {
      throw new HttpException(
        'Validation failed: No body submitted',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new HttpException('Validation failed: ' + this.prettyError(errors), HttpStatus.BAD_REQUEST);
    }

    return value;

  }

  private toValidate(metatype): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private prettyError(errors: any[]): string {
    return errors.map(err => {
        for (const property in err.constraints) {
            if (err.constraints.hasOwnProperty(property)) {
              return err.constraints[property];
            }
        }

    }).join(' ,');
  }

  private isEmpty(object: object) {
    return !(Object.keys(object).length > 0);
  }

}
