import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { Role } from "@prisma/client";

export class DashboardRouter {
  router: Router;
  controller: DashboardController;
  jwt: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new DashboardController();
    this.jwt = new JwtMiddleware();
    this.init();
  }

  init() {
    this.router.get(
      "/summary",
      this.jwt.verifyToken(process.env.JWT_SECRET!),
      requireRole([Role.ORGANIZER]),
      this.controller.getSummary
    );
  }

  getRouter() {
    return this.router;
  }
}
