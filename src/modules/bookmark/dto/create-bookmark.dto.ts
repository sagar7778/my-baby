import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {IUser} from "src/modules/user/user.interface";

export class CreateBookmarkDto {
    @IsNotEmpty()
    @IsString()
    readonly postId: string;

    @IsOptional()
    @IsString()
    readonly userId: IUser | string;
}

export class UpdateBookmarkDto {
    @IsNotEmpty()
    @IsString()
    readonly postId: string;

    @IsOptional()
    @IsString()
    readonly userId: IUser | string;
}

export class DeleteBookmarkDto {
    @IsNotEmpty()
    @IsString()
    readonly id: string;
}
