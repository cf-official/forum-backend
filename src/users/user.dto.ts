import { IsString, IsNotEmpty, MaxLength, MinLength, IsAlphanumeric, NotContains, IsEmail } from 'class-validator';

export class UserDTO {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric('en-US', {
        message: 'Password must be alphanumeric'
    })
    @NotContains(' ', {
        message: 'Password should not contain spaces'
    })
    @MaxLength(128)
    @MinLength(8)
    password: string;

    @IsEmail()
    @IsString()
    email: string;
}
