import type { Request, RequestHandler, Response } from 'express';
import prisma from '../../../utils/prisma.ts';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import APIResponse from '../../../utils/apiResponse.ts';
import jwt from 'jsonwebtoken';

export const register: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        res.status(400).json(new APIResponse(400, "All fields are required"));
        return;
    }

    const user = await prisma.user.findFirst({
        where: { email: email }
    });

    if (user) {
        res.status(401).json(new APIResponse(409, "User already exists"));
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userObj = {
        name: name,
        role: role,
        email: email,
        password: hashedPassword
    };

    const result = await prisma.user.create({
        data: userObj, select: {
            id: true,
            name: true,
            role: true,
            email: true,
            createdAt: true,
            updatedAt: true
        }
    });

    console.log(result);
    res.status(201).json(new APIResponse(201, "New user created", result));
    return;
});


export const login: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json(new APIResponse(400, "All fields are required"));
        return;
    }

    const user = await prisma.user.findFirst({
        where: { email: email },
        select: {
            id: true,
            name: true,
            role: true,
            email: true,
            password:true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        res.status(404).json(new APIResponse(404, "User not found"));
        return;
    }

    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
        res.status(401).json(new APIResponse(401, "User credentials wrong"));
        return;
    }

    const access_payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };


    const access_token = jwt.sign(
        access_payload,
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '15m' }
    );

    res.status(200).json(new APIResponse(200,"User logged in successfully", {access_token}))
    return;
});


export const logout = (req: Request, res: Response) => {
    return null
}