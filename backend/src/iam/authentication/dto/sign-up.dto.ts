import { IsEmail, MinLength } from "class-validator";

export class SignUpDto {
    @IsEmail()
    email: string;

    @MinLength(5)
    password: string;

    @MinLength(2)
    name: string;
}
