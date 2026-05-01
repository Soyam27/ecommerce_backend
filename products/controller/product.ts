import type { RequestHandler, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.ts"
import prisma from "../../utils/prisma.ts";
import APIResponse from "../../utils/apiResponse.ts";

export const addProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).user;
    const { name, description, category, price } = req.body;

    if (!name || !price || !category) {
        res.status(400).json(new APIResponse(400, "All fields are required"));
        return;
    }

    const productObj = {
        retailerId: id,
        name: name,
        description: description,
        category: category,
        price: price
    }

    const productResult = await prisma.product.create({
        data: productObj, select:
        {
            id: true,
            retailer: true,
            name: true
        }
    });

    res.status(201).json(new APIResponse(201, "Product created successful", productResult));
    return;
});

export const listProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const products = await prisma.product.findMany();
    res.status(200).json(new APIResponse(200, "Products fetched", products));
    return;
})


export const listProductCatergory: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const product = await prisma.product.findMany({ where: { category: category } });
    res.status(200).json(new APIResponse(200, "Products based on category fetched", product))
    return;
})

export const listProductReatiler: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).user;
    const products = await prisma.product.findMany({
        where: { retailerId: id }
    });
    res.status(200).json(new APIResponse(200, "Products fetched for retailer", products));
    return;
})

export const updateProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;
    const { name, description, price, category } = req.body;
    const updatedData: any = {};

    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (price !== undefined) updatedData.price = price;
    if (category !== undefined) updatedData.category = category;

    if (Object.keys(updatedData).length === 0) {
        res.status(400).json({ message: "No fields to update" });
        return;
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updatedData
    });

    res.status(200).json(new APIResponse(200, "Product updated", updatedProduct));
    return;
})


export const deleteProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
        res.status(400).json(new APIResponse(400, "Product id is required"));
        return;
    }

    const deletedData = await prisma.product.delete({ where: { id: id } });
    res.status(200).json(new APIResponse(200, "Product deleted", deletedData));
    return;
})


export const productDetails: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    //if needed implement
    return;
})
