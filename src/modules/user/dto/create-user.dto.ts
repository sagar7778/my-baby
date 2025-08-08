import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
export class UpdateUserDto extends PartialType(CreateUserDto){}

export class UpdatePasswordDto {
  @IsString()
  current_password: string;

  @IsString()
  new_password: string;
}

export class ForgotPasswordDto {
  @IsString()
  email: string;
}
export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  newPassword: string;
}
export class getProfileResponse{
  userId: string;
  email: string;
}

export class updateProfile{
  firstName:string
  lastName:string
  email:string
}