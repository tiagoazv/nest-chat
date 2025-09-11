import { IsEmail, IsEnum, IsOptional, MinLength } from "class-validator";
import { Role } from "src/user/enums/role.enum";

export class SignUpDto {
    @IsEmail()
    email: string;

    @MinLength(5)
    password: string;

    @MinLength(2)
    name: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
