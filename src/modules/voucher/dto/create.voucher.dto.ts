import { IsNotEmpty, IsString, IsNumber, IsInt, Min, Max } from "class-validator";
import { Transform } from "class-transformer";

export class CreateVoucherDTO {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  organizer_id!: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  event_id!: number;

  @IsNotEmpty()
  @IsString()
  code_voucher!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  discount_percentage!: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  max_discount_amount!: number;

  @IsNotEmpty()
  start_date!: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  usage_limit!: number;
}
