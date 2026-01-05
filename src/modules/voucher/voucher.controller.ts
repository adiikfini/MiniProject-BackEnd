import { Request, Response } from "express";
import { VoucherService } from "./voucher.service";

export class VoucherController {
  voucherService: VoucherService;

  constructor() {
    this.voucherService = new VoucherService();
  }

  getVouchers = async (req: Request, res: Response) => {
    const result = await this.voucherService.getVouchers();
    return res.status(200).send(result);
  };

   

  createVoucher = async (req: Request, res: Response) => {
    const result = await this.voucherService.createVoucher(req.body);
    return res.status(201).send(result);
  };
}
