import type { RequestHandler ,NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import APIResponse from "../../utils/apiResponse.ts";


export const isRetailerMiddleware:RequestHandler = asyncHandler(async (req: Request, res:Response, next: NextFunction) =>{
    const userObj= (req as any).user;
    const role = userObj.role;

    if(role !== 'Retailer'){
        res.status(403).json(new APIResponse(401,"Unauthorized"));
        return;
    }

    next();
})