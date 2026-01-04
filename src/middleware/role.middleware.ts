import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/api-error";

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user || !roles.includes(user.role)) {
      throw new ApiError("Forbidden", 403);
    }

    next();
  };
};
