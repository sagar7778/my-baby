import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IUser } from 'src/modules/user/user.interface';
import { Gender } from 'src/schema/kids.schema';

export class KidDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  dob: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  readonly gender: Gender;

  @IsString()
  @IsOptional()
  userId: IUser | string;
}

export class UpdateKidDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  userId?: IUser;
}
export class KidResponseDto {
  id: string;
  name: string;
  dob: string;
  gender: Gender;
  userId: IUser;
}
export class deleteKidResponseDto {
  message: string;
}
