import { Router } from "express";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { CreateVoucherDTO } from "./dto/create.voucher.dto";
import { VoucherController } from "./voucher.controller";

export class VoucherRouter {
  router: Router;
  voucherController: VoucherController;

  constructor() {
    this.router = Router();
    this.voucherController = new VoucherController();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/", this.voucherController.getVouchers);
    this.router.post(
      "/",
      validateBody(CreateVoucherDTO),
      this.voucherController.createVoucher
    );
  };

  getRouter = () => {
    return this.router;
  };
}
