import { Products } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../model/prisma.model";

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const productoId = parseInt(req.params.id);

  try {
    const product: Products | null = await prisma.products.findUnique({
      where: { productoId },
    });

    if (!product) {
      res
        .status(400)
        .json({ estado: "error", mensaje: "El producto no se encontró." });
      return;
    }

    res.locals.product = product;

    next();
  } catch (error) {
    console.error("Error en getProductById - products.middleware:", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error interno del servidor al traer el producto.",
    });
  }
};
