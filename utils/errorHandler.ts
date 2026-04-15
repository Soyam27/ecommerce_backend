import type {NextFunction, Request, Response } from "express";

export const errorHandler = (err: any,req: Request,res: Response,next: NextFunction) =>{
    console.log(err);
    res.status(err.statusCode || 500).json({

        "message": err.message || "Internal server error",
        "success":err.success

    });
}