import {
  IsString,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateEventDTO {
  @IsString()
  name_price!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  price!: number;

  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  is_paid!: boolean;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  total_seats!: number;

  @IsString()
  description!: string;

  @IsString()
  location!: string;

  @IsString()
  category!: string;
}
