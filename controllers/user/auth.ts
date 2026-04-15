import type {Request, Response} from 'express';
import prisma from '../../utils/prisma.ts';
import bcrypt from 'bcryptjs';

export const register = async (req: Request,res: Response) =>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({"message":"All the fields are Required"});
    }

    const user = await prisma.user.findFirst({
        where: {email:email}
    });

    if(user){
        return res.status(401).json({"message":"User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const userObj = {
        name: name,
        email: email,
        password: hashedPassword
    };

    const result = await prisma.user.create({data: userObj});

    console.log(result);
    return res.status(201).json({"message":"user created"});
}


export const login = (req: Request, res: Response) =>{
    return null
}


export const logout = (req: Request, res: Response) =>{
    return null
}