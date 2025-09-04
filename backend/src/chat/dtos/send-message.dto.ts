import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    readonly from: string;

    @IsString()
    @IsNotEmpty()
    readonly to: string;

    @IsString()
    @IsNotEmpty()
    readonly content: string;
}
