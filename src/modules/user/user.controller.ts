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

  //   getUser = async (userId: number) => {
  //   const user = await this.prisma.user.findUnique({
  //     where: { user_id: userId },
  //     select: {
  //       user_id: true,
  //       name: true,
  //       email: true,
  //       role: true,
  //       profile_picture_url: true,
  //       point_balance: true,
  //     },
  //   });
  //   if (!user) throw new ApiError("User not found", 404);

  //   const activePoints = await this.prisma.pointHistory.aggregate({
  //     where: {
  //       user_id: userId,
  //       expires_at: { gt: new Date() },
  //     },
  //     _sum: {
  //       amount: true,
  //     },
  //   });

  //   return {
  //     ...user,
  //     active_points: activePoints._sum.amount ?? 0,
  //   };
  // };

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
