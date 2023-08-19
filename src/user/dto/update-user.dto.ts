import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
