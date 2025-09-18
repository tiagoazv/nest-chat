import { ActiveUser } from "src/iam/authentication/authentication.types";
import { REQUEST_USER_KEY } from "src/iam/iam.constants";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Response, NextFunction } from "express";

type Request = {
  user: ActiveUser | undefined;
  headers: any;
  isAuthenticated: (request: Request) => boolean;
};

const isAuthenticatedFunction = () => true;

@Injectable()
export class AuthTestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userHeader = req.headers["user"];
    const authorized = typeof userHeader === "string" && userHeader !== "";
    let requestUser: ActiveUser | undefined;

    if (authorized) {
      req.isAuthenticated = isAuthenticatedFunction;
      requestUser = JSON.parse(userHeader);
      req[REQUEST_USER_KEY] = requestUser;
    }

    next();
  }
}
