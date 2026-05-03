import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import prisma from "../../utils/prisma.ts";
import APIResponse from "../../utils/apiResponse.ts";

export const cartItem:RequestHandler = asyncHandler(async (req:Request,res:Response) =>{
    const {id} = (req as any).user;
    const cartObj = await prisma.cart.findFirst({
        where:{userId:id},
        include:{
            cartItems:true
        }
    });

    if(!cartObj){
        res.status(404).json(new APIResponse(404,"Cart doesn't exists"));
        return;
    }

    const items = cartObj.cartItems;

    res.status(200).json(new APIResponse(200,"Items Fetached",items))
    return;
});

export const addCartItem:RequestHandler = asyncHandler(async (req:Request,res:Response) =>{
    const {id} = (req as any).user;
    const {quantity, productId} = (req as any).user;
    
    if(!productId){
        res.status(401).json(new APIResponse(401,"Please add product"));
        return;
    }

    const qty = quantity && quantity>0?quantity:1;

    const product = await prisma.product.findFirst({where:{id:productId}});

    if(!product){
        res.status(404).json(new APIResponse(404,"Product doesnt exists"));
        return;
    }

    let cart = await prisma.cart.findFirst({
        where:{
            userId:id
        }
    });

    if(!cart){
        cart = await prisma.cart.create({
            data:{userId:id}
        });
    }

    const cartItem = await prisma.cartItems.upsert({
        where: {
            cartId_productId:{
                cartId:cart.id,
                productId:productId
            }
        },
        update:{
            quantity:{
                increment: qty
            }
        },
        create:{
            cartId: cart.id,
            productId:productId,
            quantity:1,
            price:product.price   
        }
    });

    res.status(200).json(new APIResponse(200,"Item added",cartItem));

    return;
});

export const incCartItem:RequestHandler = asyncHandler(async (req:Request,res:Response) =>{
    const {pid} = (req as any).params;
    const {id} = (req as any).user

    if(!pid){
        res.status(400).json(new APIResponse(400,"Item id is required"));
        return;
    }

    const cart = await prisma.cart.findFirst({
        where: {
            userId: id
        }
    });

    if(!cart){
        res.status(404).json(new APIResponse(404,"Cart not found"));
        return;
    }

    const product = await prisma.product.findFirst({where:{id:pid}});

    if(!product){
        res.status(404).json(new APIResponse(404,"Product doesnt exists"));
        return;
    }

    const result = await prisma.cartItems.upsert({
        where:{
            cartId_productId:{
                cartId: cart.id,
                productId: pid
            }
        },
        update:{
            quantity:{
                increment:1
            }
        },
        create:{
            cartId: cart.id,
            productId: pid,
            quantity: 1,
            price: product.price
        }
    });

    res.status(200).json(new APIResponse(200,"Item incremented",result));

    return;
});

export const remCartItem:RequestHandler = asyncHandler(async (req:Request,res:Response) =>{
    const {pid} = (req as any).user;
    const {id} = (req as any).user;
    
    if(!pid){
        res.status(400).json(new APIResponse(400,"Item id is required"));
        return;
    }

    const result = await prisma.cartItems.delete({where:{
        id:pid
    }});

    if(!result){
        res.status(400).json(new APIResponse(400,"Cart item doesn't exists"));
        return;
    }

    res.status(200).json(new APIResponse(200,"Cart item deleted",result));
    return;
});