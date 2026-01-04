import { sign } from "jsonwebtoken";
import { ApiError } from "../../utils/api-error";
import { comparePassword, hashPassword } from "../../utils/password";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { generateReferralCode } from "../../utils/refferral";
import { addMonths } from "../../utils/date";

export class AuthService {
  prisma: PrismaService;
  mailService: MailService;

  constructor() {
    this.prisma = new PrismaService();
    this.mailService = new MailService();
  }

  register = async (body: RegisterDTO) => {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingUser) throw new ApiError("email already exist", 400);

    // 1. Validate referral (ONLY CUSTOMER)
    let referrerUser = null;

    if (body.role === "CUSTOMER" && body.refferal_code) {
      referrerUser = await this.prisma.user.findFirst({
        where: { refferal_code: body.refferal_code },
      });

      if (!referrerUser) {
        throw new ApiError("Invalid referral code", 400);
      }
    }

    const hashedPassword = await hashPassword(body.password);
    const generatedReferralCode = generateReferralCode();

    // 2. Create user
    const newUser = await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
        refferal_code: generatedReferralCode,
      },
    });

    if (body.role === "ORGANIZER") {
      await this.prisma.eventOrganizer.create({
        data: {
          user_id: newUser.user_id,
          company_name: body.name,
          description: "",
        },
      });
    }

    // 3. Create referral relation + reward
    if (referrerUser) {
      // 3.1 create referral relation
      await this.prisma.referral.create({
        data: {
          referrer_user_id: referrerUser.user_id,
          referred_user_id: newUser.user_id,
          status: "SUCCESS",
        },
      });

      // 3.2 calculate expiration
      const now = new Date();
      const expiredAt = addMonths(now, 3);

      // 3.3 create point history (SOURCE OF TRUTH)
      await this.prisma.pointHistory.create({
        data: {
          user_id: referrerUser.user_id,
          amount: 10000,
          type: "REFERRAL_REWARD",
          description: `Referral reward from ${newUser.email}`,
          create_at: now,
          expires_at: expiredAt,
        },
      });

      // 3.4 update cached balance (optional but useful)
      await this.prisma.user.update({
        where: { user_id: referrerUser.user_id },
        data: {
          point_balance: { increment: 10000 },
        },
      });

      // 3.4 create coupon for NEW USER
      const coupon = await this.prisma.rewardCoupon.create({
        data: {
          code: `REF-${newUser.user_id}-${Date.now()}`,
          discount_percentage: 10,
          max_discount_amount: 50000,
          expiration_date: expiredAt,
        },
      });

      // 3.5 assign coupon to NEW USER
      await this.prisma.userCoupon.create({
        data: {
          user_id: newUser.user_id,
          coupon_id: coupon.coupon_id,
          valid_until: expiredAt,
        },
      });
    }

    return { message: "register success" };
  };

  login = async (body: LoginDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) throw new ApiError("Invalid credentials", 400);

    const isPasswordMatch = await comparePassword(body.password, user.password);
    if (!isPasswordMatch) throw new ApiError("Invalid credentials", 400);

    const payload = {
      id: user.user_id,
      role: user.role,
    };

    const accessToken = sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    return {
      id: user.user_id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
    };
  };

  forgotPassword = async (body: ForgotPasswordDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) throw new ApiError("User not found", 404);

    const payload = { id: user.user_id };
    const accessToken = sign(payload, process.env.JWT_SECRET_RESET!, {
      expiresIn: "15m",
    });

    await this.mailService.sendEmail(
      body.email,
      "Forgot Password",
      "forgot-password",
      {
        resetUrl: `http://localhost:3000/reset-password/${accessToken}`,
      }
    );

    return { message: "send email success" };
  };

  resetPassword = async (body: ResetPasswordDTO, authUserId: number) => {
    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.update({
      where: { user_id: authUserId },
      data: { password: hashedPassword },
    });

    return { message: "reset password success" };
  };
}
