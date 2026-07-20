import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(
    request: Request & { requestId?: string },
    response: Response,
    next: NextFunction,
  ): void {
    const supplied = request.header("x-request-id");
    request.requestId =
      supplied && /^[A-Za-z0-9._-]{8,128}$/.test(supplied)
        ? supplied
        : `req_${randomUUID()}`;
    response.setHeader("X-Request-Id", request.requestId);
    next();
  }
}
