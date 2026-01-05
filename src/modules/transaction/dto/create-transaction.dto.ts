// src/modules/transaction/dto/create-transaction.dto.ts
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class TransactionItemDTO {
  @IsInt()
  tiket_id!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateTransactionDTO {
  @IsInt()
  event_id!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDTO)
  items!: TransactionItemDTO[];

  @IsOptional()
  @IsInt()
  coupon_id?: number;

  @IsOptional()
  @IsInt()
  voucher_id?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  point_used?: number;
}
