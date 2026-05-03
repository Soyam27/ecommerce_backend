import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import prisma from "../../utils/prisma.ts";
import APIResponse from "../../utils/apiResponse.ts";

export const initOrder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).user;
    const cart = await prisma.cart.findFirst({
        where: {
            userId: id
        },
        include: {
            cartItems: {
                include: {
                    cartProduct: {
                        include: {
                            retailer: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        },

                    }
                }
            }
        }
    });

    if (!cart) {
        res.status(404).json(new APIResponse(404, "Cart is not available"));
        return;
    }

    const itemList = cart.cartItems;

    if (itemList.length === 0) {
        res.status(400).json(new APIResponse(400, "Cart is empty"));
        return;
    }

    const groupedRetailers = itemList.reduce((acc, item) => {
        const retailer = item.cartProduct.retailer;
        const retailerId = retailer.id;

        if (!acc[retailerId]) {
            acc[retailerId] = {
                retailer: {
                    id: retailer.id,
                    name: retailer.name
                },
                items: [],
                total_amount: 0,
            };
        }

        acc[retailerId].items.push(item);
        acc[retailerId].total_amount += (item.cartProduct.price.toNumber()) * (item.quantity);

        return acc;
    }, {} as Record<
        string,
        {
            retailer: {
                id: string;
                name: string;
            };
            items: typeof itemList;
            total_amount: number;
        }
    >);

    const listGroupedRetailers = Object.values(groupedRetailers);

    let response: any = {}

    for (const item_order of listGroupedRetailers) {
        const result = await prisma.order.create({
            data: {
                userId: id,
                total_amount: item_order.total_amount,
                orders: {
                    create: item_order.items.map((o) => ({
                        productid: o.cartProduct.id,
                        quantity: o.quantity,
                        price_at_purchase: o.price.toNumber()

                    }))
                }
            }
        })
        response[item_order.retailer.id] = result
    }

    res.status(201).json(
        new APIResponse(201, "Orders created successfully", response)
    );
    return;
});

export const listOrder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const {id} = (req as any).user;

    const orders = await prisma.order.findMany({
        where:{userId:id}
    });

    if(orders.length === 0){
        res.status(404).json(new APIResponse(404,"No orders found"));
        return;
    }

    res.status(200).json(new APIResponse(200,"All orders fetched",orders));
    return;
});

export const listSingleOrder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const {id} = (req as any).user;
    const oid = (req as any).params.id;
    
    if(!oid){
        res.status(404).json(new APIResponse(404,"No order Id found"));
        return;
    }

    const order = await prisma.order.findFirst({
        where:{
            userId:id,
            id:oid
        },
        include:{
            orders:true
        }
    });

    if(!order){
        res.status(404).json(new APIResponse(404,"No Order found"));
        return;
    }

    res.status(200).json(new APIResponse(200,"Order details fetched",order));
    return;
});