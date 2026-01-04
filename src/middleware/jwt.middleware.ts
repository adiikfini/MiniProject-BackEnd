import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { ApiError } from "../utils/api-error";

export class JwtMiddleware {
  verifyToken = (secretKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) throw new ApiError("no token provided", 401);

      verify(token, secretKey, (err, payload) => {
        if (err) {
          throw new ApiError("invalid token / token expired", 401);
        }

        res.locals.user = payload;
        next();
      });
    };
  };
}


