import express, { Express, Request, Response } from "express";
import cors from "cors";
import { PORT } from "./config/env";
import { SampleRouter } from "./modules/sample/sample.router";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { AuthRouter } from "./modules/auth/auth.router";
import { EventRouter } from "./modules/event/event.router";
import { VoucherRouter } from "./modules/voucher/voucher.router";
import { UserRouter } from "./modules/user/user.router";
import { TransactionRouter } from "./modules/transaction/transaction.router";
import { DashboardRouter } from "./modules/dashboard/dashboard.router";

export class App {
  app: Express;
  constructor() {
    this.app = require("express")();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes() {
    const sampleRouter = new SampleRouter();
    const authRouter = new AuthRouter();
    const eventRouter = new EventRouter();
    const voucherRouter = new VoucherRouter();
    const userRouter = new UserRouter();
    const transactionRouter = new TransactionRouter();
    const dashboardRouter = new DashboardRouter();

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
    this.app.use("/vouchers", voucherRouter.getRouter());
    this.app.use("/users", userRouter.getRouter());
    this.app.use("/transactions", transactionRouter.getRouter());
    this.app.use("/dashboard", dashboardRouter.getRouter());


  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server is running on port, ${PORT}`);
    });
  }
}
