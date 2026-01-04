import { IsNotEmpty } from "class-validator";

export class UploadPaymentProofDTO {
  @IsNotEmpty()
  transaction_id!: number;
}
