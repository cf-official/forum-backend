import {
    IsString,
    IsObject,
    MaxLength
} from 'class-validator';

export class CategoryDTO {
    @IsString()
    @MaxLength(256)
    name: string;

    @IsString()
    @MaxLength(512)
    description: string;

    @IsObject()
    advancedPerms: object;
}
