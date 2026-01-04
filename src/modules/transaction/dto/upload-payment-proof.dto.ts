// src/modules/transaction/dto/upload-payment-proof.dto.ts
import { IsNotEmpty } from "class-validator";

export class UploadPaymentProofDTO {
  @IsNotEmpty()
  transaction_id!: number;
}
