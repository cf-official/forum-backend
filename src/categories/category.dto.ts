import { IsString, IsArray, ValidateNested, IsObject, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryDTO {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsObject()
    advancedPerms: object;
}
