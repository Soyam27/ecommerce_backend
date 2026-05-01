import type { Request, Response, NextFunction, RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import APIResponse from "../../utils/apiResponse.ts";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma.ts";
export const authMiddleware: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    //Bearer djllsafhjlkasdhfjkhasd
    const Authorization = req.headers.authorization;
    const authHeader = Array.isArray(Authorization) ? Authorization[0] : Authorization

    if (!authHeader) {
        res.status(401).json(new APIResponse(401, "User not logged in"))
        return
    }

    const [authtype, token] = authHeader.split(' ')

    if (authtype !== 'Bearer' || !token) {
        res.status(400).json(new APIResponse(400, "Wrong authorization header"))
        return;
    }

    let payload;

    try {
        payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    } catch (error) {
        res.status(401).json(new APIResponse(401, "Invalid or expired token"));
        return;
    }


    const { id, email } = payload as { id: string, email: string, role: string };

    const user = await prisma.user.findFirst({
        where: {
            email: email
        }
    });

    if (!user) {
        res.status(404).json(new APIResponse(404, "User not found"))
        return;
    }

    (req as any).user = user;
    next();

})