import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { Role } from "@prisma/client";

export class TransactionRouter {
  router: Router;
  controller: TransactionController;
  jwt: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new TransactionController();
    this.jwt = new JwtMiddleware();
    this.init();
  }

  init() {
    this.router.get(
      "/organizer",
      this.jwt.verifyToken(process.env.JWT_SECRET!),
      requireRole([Role.ORGANIZER]),
      this.controller.getOrganizerTransactions
    );

    this.router.patch(
      "/:id/accept",
      this.jwt.verifyToken(process.env.JWT_SECRET!),
      requireRole([Role.ORGANIZER]),
      this.controller.acceptTransaction
    );

    this.router.patch(
      "/:id/reject",
      this.jwt.verifyToken(process.env.JWT_SECRET!),
      requireRole([Role.ORGANIZER]),
      this.controller.rejectTransaction
    );
  }

  getRouter() {
    return this.router;
  }
}
