import { NextFunction, Request, Response } from "express";
import prisma from "../model/prisma.model";

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const orderId = req.params.id

    try {
        const order = await prisma.order.findUnique({
            where: {orderId},
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                foto: true,
                                stock_disponible: true
                            }
                        }
                    }
                }
            }
        })

        if (!order) {
            res.status(404).json({estado: "error", mensaje: "La orden no se encontró."})
            return
        }

        res.locals.order = order

        next()

    } catch (error) {
        console.log("Error en getOrderById - order.middleware - ", error)
        res.status(500).json({estado: "error", mensaje: "Error en el servidor al traer la orden."})
    }

}

