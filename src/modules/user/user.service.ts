import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { comparePassword, hashPassword } from "../../utils/password";
import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

export class UserService {
  prisma: PrismaService;
  cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  /* ======================
     GET ALL USERS
  ======================= */
  getUsers = async () => {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone_number: true,
        profile_picture_url: true,
        point_balance: true,
      },
    });
  };

  getUser = async (userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        profile_picture_url: true,
        point_balance: true,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    const activePoints = await this.prisma.pointHistory.aggregate({
      where: {
        user_id: userId,
        expires_at: { gt: new Date() },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      ...user,
      active_points: activePoints._sum.amount ?? 0,
    };
  };

  /* ======================
     CREATE USER (ADMIN / INTERNAL)
  ======================= */
  createUser = async (body: CreateUserDTO, file?: Express.Multer.File) => {
    // 1. check email uniqueness
    const existingUser = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ApiError("Email already exists", 400);
    }

    // 2. hash password
    const hashedPassword = await hashPassword(body.password);

    // 3. upload profile picture (optional)
    let profilePictureUrl: string | undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.upload(file);
      profilePictureUrl = uploadResult.secure_url;
    }

    // 4. create user
    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role ?? Role.CUSTOMER,
        phone_number: body.phone_number,
        profile_picture_url: profilePictureUrl,
      },
    });

    return {
      message: "create user success",
      user_id: user.user_id,
    };
  };

  getMyActiveCoupons = async (userId: number) => {
    return this.prisma.userCoupon.findMany({
      where: {
        user_id: userId,
        is_used: false,
        valid_until: { gt: new Date() },
      },
      include: {
        coupon: true,
      },
    });
  };

  updateProfile = async (
    userId: number,
    body: { name?: string },
    file?: Express.Multer.File
  ) => {
    let profilePictureUrl: string | undefined;

    // 1. upload avatar kalau ada
    if (file) {
      const uploadResult = await this.cloudinaryService.upload(file);
      profilePictureUrl = uploadResult.secure_url;
    }

    // 2. update user
    await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        name: body.name,
        ...(profilePictureUrl && {
          profile_picture_url: profilePictureUrl,
        }),
      },
    });

    return { message: "Profile updated successfully" };
  };

  changePassword = async (
    userId: number,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // ✅ FIX: argon2 verify
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new ApiError("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      throw new ApiError("New password must be different", 400);
    }

    const hashed = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { user_id: userId },
      data: { password: hashed },
    });

    return { message: "Password updated successfully" };
  };
}
