import { Router } from "express";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { CreateVoucherDTO } from "./dto/create.voucher.dto";
import { VoucherController } from "./voucher.controller";

export class VoucherRouter {
  router: Router;
  voucherController: VoucherController;
//   uploaderMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.voucherController = new VoucherController();
    // this.uploaderMiddleware = new UploaderMiddleware();
    this.initRoutes();
  }

  //   private initRoutes = () => {
  //     this.router.get("/", this.voucherController.getVouchers);
  //     this.router.post(
  //       "/",
  //       this.uploaderMiddleware.upload().fields([{ name: "image", maxCount: 1 }]),
  //       validateBody(CreateVoucherDTO),
  //       this.voucherController.createVoucher
  //     );
  //   };

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
