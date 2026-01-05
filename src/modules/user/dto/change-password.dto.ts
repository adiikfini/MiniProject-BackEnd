import { IsString, MinLength } from "class-validator";

export class ChangePasswordDTO {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}
