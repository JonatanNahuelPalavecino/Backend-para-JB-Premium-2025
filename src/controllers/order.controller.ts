import { Request, Response } from "express";
import prisma from "../model/prisma.model";
import { randomUUID } from "crypto";
import { aumentarStockDisponible, disminuirStockDisponible, StockValidationResult, sumarTotal, verifyStockDisponible } from "../services/products.services";
import { createLinkMercadoPago, LinkMercadoPago } from "../services/createLinkMercadoPago.services";
import { ItemsOrder } from "@prisma/client";

export const getAllOrdersByfilters = async (req: Request, res: Response): Promise<void> => {
    const {filters} = req.body

    try {
        const orders = await prisma.order.findMany({
            where: {...filters},
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
                },
                user: {
                    select: {
                        nombre: true,
                        email: true,
                        apellido: true
                    }
                }
            }
        })

        if (orders.length === 0) {
            res.status(404).json({estado: "error", mensaje: "La busqueda no encontró resultados con los filtros establecidos."})
            return
        }

        res.status(200).json({estado: "success", mensaje: "Busqueda realizada con exito.", orders})
    } catch (error) {
        console.log("Error en getAllOrders - order.controller - ", error)
        res.status(500).json({estado: "error", mensaje: "Error en el servidor al traer las ordenes."})
    }
}

export const getUniqueOrder = async (req: Request, res: Response): Promise<void> => {
    const order = res.locals.order

    try {
        res.status(200).json({estado: "success", mensaje: "Orden traida con exito.", order})
    } catch (error) {
        console.log("Error en getUniqueOrder - order.controller - ", error)
        res.status(500).json({estado: "error", mensaje: "Error en el servidor al traer la orden."})
    }
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const orderId: string = randomUUID()
    const {orden, carrito} = req.body

    const validateStock: StockValidationResult = await verifyStockDisponible(carrito)
    if (validateStock.estado === "error") {
        res.status(400).json(validateStock)
        return
    }

    const total: number = sumarTotal(carrito)

    const linkMercadoPago: LinkMercadoPago = await createLinkMercadoPago(total, orderId)
    if (linkMercadoPago.estado === "error") {
        res.status(400).json(linkMercadoPago)
    }

    try {
        await prisma.order.create({
            data: {
                orderId,
                userId: orden.userId,
                direccion: orden.direccion,
                localidad: orden.localidad,
                provincia: orden.provincia,
                telefono: orden.telefono,
                codigoPostal: orden.codigoPostal,
                total,
                link_pago: linkMercadoPago.link,
                items: {
                    create: carrito.map((item: ItemsOrder) => ({
                        productoId: item.productoId,
                        nombre: item.nombre,
                        cantidad: item.cantidad,
                        precio: item.precio
                    }))
                }
            },
            include: {items: true}
        })

        await disminuirStockDisponible(carrito)

        res.status(201).json({estado: "success", mensaje: "Orden creada con exito.", orderId, link: linkMercadoPago.link})
    } catch (error) {
        console.log("Error en createOrder - order.controller - ", error)
        res.status(500).json({estado: "error", mensaje: "Error en el servidor al crear la orden."})
    }
}

export const modifyUniqueOrder = async (req: Request, res: Response): Promise<void> => {
    const order = res.locals.order
    const {nuevaOrden, nuevoCarrito} = req.body.filters

    const {orderId, estado} = order

    if (estado === "approved") {
        res.status(401).json({estado: "error", mensaje: "No se puede modificar una orden pagada."})
        return
    }

    const validateStock: StockValidationResult = await verifyStockDisponible(nuevoCarrito)
    if (validateStock.estado === "error") {
        res.status(400).json(validateStock)
        return
    }

    const total: number = sumarTotal(nuevoCarrito)

    const linkMercadoPago: LinkMercadoPago = await createLinkMercadoPago(total, orderId)
    if (linkMercadoPago.estado === "error") {
        res.status(400).json(linkMercadoPago)
    }
    
    try {
        await prisma.order.update({
            where: {orderId},
            data: {
                ...nuevaOrden,
                total,
                link_pago: linkMercadoPago.link
            }
        })

        if (nuevoCarrito.length > 0){
            await prisma.itemsOrder.deleteMany({
                where: {orderId}
            })
            await aumentarStockDisponible(order.items)

            const carrito = nuevoCarrito.map((item: ItemsOrder) => ({
                orderId,
                productoId: item.productoId,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precio,
            }))

            await prisma.itemsOrder.createMany({data: carrito})
            await disminuirStockDisponible(carrito)
        }

        res.status(201).json({estado: "success", mensaje: `La orden ${orderId} ha sido modificada con exito.`, link: linkMercadoPago.link})
    } catch (error) {
        console.log("Error en order modifyUniqueOrder - order.controller - ", error)
        res.status(500).json({estado: "error", mensaje: "Error en el servidor al intentar modificar la orden."})
    }

}

export const deleteUniqueOrder = async (req: Request, res: Response): Promise<void> => {
    const order = res.locals.order
    const {orderId, estado, items} = order

    if (estado === "approved") {    
        res.status(401).json({estado: "error", mensaje: "No se puede eliminar una orden pagada."})
        return
    }

    try {
        await prisma.order.delete({
            where: {orderId}
        })

        await prisma.itemsOrder.deleteMany({
            where: {orderId}
        })

        estado === "pending" && await aumentarStockDisponible(items)

        res.status(200).json({estado: "success", mensaje: `La orden ${orderId} ha sido eliminada.`})
    } catch (error) {
        console.log("Error en order deleteUniqueOrder - order.controller - ", error)
        res.status(500).json({estado: "error", mensaje: "Error en el servidor al intentar eliminar la orden."})
    }
}