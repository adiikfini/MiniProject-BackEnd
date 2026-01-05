import { Request, Response } from "express";
import { UserService } from "./user.service";
import { ApiError } from "../../utils/api-error";

export class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req: Request, res: Response) => {
    const result = await this.userService.getUsers();
    return res.status(200).send(result);
  };

  getUser = async (req: Request, res: Response) => {
    const userId = res.locals.user.id; // dari JWT
    const result = await this.userService.getUser(userId);
    return res.status(200).send(result);
  };

  createUser = async (req: Request, res: Response) => {
    const body = req.body;
    const file = req.file;
    const result = await this.userService.createUser(body, file);
    return res.status(201).send(result);
  };

  getMyCoupons = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.userService.getMyActiveCoupons(userId);
    return res.status(200).send(result);
  };

  updateProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id; // dari JWT middleware
    const body = req.body;
    const file = req.file;

    const result = await this.userService.updateProfile(userId, body, file);

    return res.status(200).send(result);
  };

  changePassword = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await this.userService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).send(result);
  };
}
