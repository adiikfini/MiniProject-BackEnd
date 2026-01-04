import { Router } from "express";
import { AuthController } from "./auth.controller";
import { RegisterDTO } from "./dto/register.dto";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { LoginDTO } from "./dto/login.dto";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { ResetPasswordDTO } from "./dto/reset-password.dto";

export class AuthRouter {
  router: Router;
  authController: AuthController;
  jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/register",
      validateBody(RegisterDTO),
      this.authController.register
    );
    this.router.post(
      "/login",
      validateBody(LoginDTO),
      this.authController.login
    );
    this.router.post(
      "/forgot-password",
      validateBody(ForgotPasswordDTO),
      this.authController.forgotPassword
    );
    this.router.post(
      "/reset-password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_RESET!),
      validateBody(ResetPasswordDTO),
      this.authController.resetPassword
    );
  };

  getRouter = () => {
    return this.router;
  };
}
