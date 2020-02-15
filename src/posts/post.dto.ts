import { IsString, MaxLength, MinLength, IsBoolean, IsNumberString } from 'class-validator';

export class PostDTO {

    @IsNumberString()
    thread: string;

    @IsString()
    @MaxLength(128)
    @MinLength(3)
    title: string;

    @IsString()
    @MaxLength(10000)
    @MinLength(10)
    content: string;

    @IsBoolean()
    pinned: boolean;

    @IsBoolean()
    isPoll: boolean;

}
