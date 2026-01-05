import { Router } from "express";
import { validateBody } from "../../middleware/validation.middleware";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UserController } from "./user.controller";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { ChangePasswordDTO } from "./dto/change-password.dto";

export class UserRouter {
  router: Router;
  userController: UserController;
  jwtMiddleware: JwtMiddleware;
  uploaderMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initRoutes();
  }

  private initRoutes = () => {
    // GET ALL USERS (ADMIN / INTERNAL)
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      requireRole(["ORGANIZER"]), // atau ADMIN kalau nanti ada
      this.userController.getUsers
    );

    this.router.get(
      "/me",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.userController.getUser
    );

    // CREATE USER (ADMIN / INTERNAL)
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      requireRole(["ORGANIZER"]), // atau ADMIN
      this.uploaderMiddleware.upload().single("profile_picture"),
      validateBody(CreateUserDTO),
      this.userController.createUser
    );

    this.router.get(
      "/me/coupons",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.userController.getMyCoupons
    );

    this.router.patch(
      "/me",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.uploaderMiddleware.upload().single("profile_picture"),
      this.userController.updateProfile
    );

    this.router.patch(
      "/me/password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      validateBody(ChangePasswordDTO),
      this.userController.changePassword
    );
  };

  getRouter = () => {
    return this.router;
  };
}
