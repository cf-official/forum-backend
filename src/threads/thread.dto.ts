import {
    IsString,
    MaxLength,
    IsNumberString
} from 'class-validator';

export class ThreadDTO {
    @IsNumberString()
    categoryId: string;

    @IsString()
    @MaxLength(256)
    title: string;

    @IsString()
    @MaxLength(512)
    description: string;
}
