import APIError from "./apiError.ts";
import type { NextFunction, Request,RequestHandler,Response } from "express";

export const asyncHandler = (asyncFunction: (req: Request, res: Response, next: NextFunction ) => Promise<void>):RequestHandler =>{
    return async (req: Request, res: Response, next:NextFunction) =>{
        try {
            await asyncFunction(req,res,next);
        } catch (error: unknown) {
            const err = error instanceof Error? error: new Error("Something went wrong");
            next(new APIError(500, err.message));
        }
    }
}