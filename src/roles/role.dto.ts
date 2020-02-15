import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { BitPerm } from 'src/shared/BitPerm';

export class RoleDTO {

    @IsString()
    name: string;

    @IsNumber()
    allowed: number;

    @IsNumber()
    denied: number;

    @IsNumber()
    position: number;

}
