import { ItemsOrder, Products } from "@prisma/client"
import prisma from "../model/prisma.model"
import { ProductUpdateBody } from "../model/productUpdate"
import cloudinary from "../config/cloudinary.config";

export interface StockValidationResult {
    estado: string
    mensaje: string
}

interface FileToDelete {
    filename?: string; 
    url?: string;     
    type: "image" | "pdf";
  }
  

export const verifyStockDisponible = async (carrito: Array<ItemsOrder>): Promise<StockValidationResult> => {
    for (let item of carrito) {

        if (item.productoId) {

            const producto = await prisma.products.findUnique({
                where: {productoId: item.productoId}
            })

            if(!producto || producto.stock_disponible < item.cantidad) {
                return {estado: "error", mensaje: `No hay stock suficiente para el producto ${producto?.nombre}.`}   
            }
        }

    }

    return {estado: "success", mensaje: "Stock verificado con exito."}
}

export const disminuirStockDisponible = async (carrito: Array<ItemsOrder>): Promise<void> => {
    for (let item of carrito) {

        if (item.productoId) {
            await prisma.products.update({
                where: {productoId: item.productoId},
                data: {stock_disponible: { decrement: item.cantidad}}
            })
        }
    }
}

export const aumentarStockDisponible = async (carrito: Array<ItemsOrder>): Promise<void> => {
    for (let item of carrito) {

        if (item.productoId) {
            await prisma.products.update({
                where: {productoId: item.productoId},
                data: {stock_disponible: { increment: item.cantidad}}
            })
        }
    }
}

export const disminuirStockTotal = async (carrito: Array<ItemsOrder>): Promise<void> => {
    for (let item of carrito) {
        if (item.productoId) {
            await prisma.products.update({
                where: {productoId: item.productoId},
                data: {stock_total: { decrement: item.cantidad}}
            })
        }
    }
}

export const aumentarStockTotal = async (carrito: Array<ItemsOrder>): Promise<void> => {
    for (let item of carrito) {
        if (item.productoId) {
            await prisma.products.update({
                where: {productoId: item.productoId},
                data: {stock_total: { increment: item.cantidad}}
            })
        }
    }
}

export const sumarTotal = (carrito: Array<ItemsOrder>): number => {
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
}

export const actualizarProducto = (body: ProductUpdateBody): Partial<Products> => {
    const updatedData: Partial<Products> = {};

    // Incluir solo los campos de texto que se enviaron en req.body
    if (body.nombre !== undefined) updatedData.nombre = body.nombre;
    if (body.precio !== undefined) updatedData.precio = parseFloat(body.precio as string);
    if (body.stock_disponible !== undefined) updatedData.stock_disponible = parseInt(body.stock_disponible as string);
    if (body.stock_total !== undefined) updatedData.stock_total = parseInt(body.stock_total as string);
    if (body.activo !== undefined) updatedData.activo = body.activo === "true" ? true : false;
    if (body.accesorio !== undefined) updatedData.accesorio = body.accesorio === "true" ? true : false;
    if (body.porcDesc !== undefined) updatedData.porcDesc = parseInt(body.porcDesc as string);
    if (body.destacado !== undefined) updatedData.destacado = body.destacado === "true" ? true : false;
    if (body.bodega !== undefined) updatedData.bodega = body.bodega;
    if (body.cosecha !== undefined) updatedData.cosecha = body.cosecha;
    if (body.region !== undefined) updatedData.region = body.region;
    if (body.crianza !== undefined) updatedData.crianza = body.crianza;
    if (body.descUno !== undefined) updatedData.descUno = body.descUno;
    if (body.descDos !== undefined) updatedData.descDos = body.descDos;
    if (body.faseGus !== undefined) updatedData.faseGus = body.faseGus;
    if (body.faseOlf !== undefined) updatedData.faseOlf = body.faseOlf;
    if (body.faseVis !== undefined) updatedData.faseVis = body.faseVis;
    if (body.grado !== undefined) updatedData.grado = body.grado;
    if (body.maridaje !== undefined) updatedData.maridaje = body.maridaje;
    if (body.temp !== undefined) updatedData.temp = body.temp;
    if (body.tipo !== undefined) updatedData.tipo = body.tipo;
    if (body.ubicacion !== undefined) updatedData.ubicacion = body.ubicacion;
    if (body.vino !== undefined) updatedData.vino = body.vino;
    if (body.detalle !== undefined) updatedData.detalle = body.detalle;
    if (body.promocion !== undefined) updatedData.promocion = body.promocion === "true" ? true : false;
  
    return updatedData;
}

export const eliminarArchivo = async (file: FileToDelete): Promise<void> => {
    try {
      let publicId: string | undefined;
  
      if (file.url) {
        publicId = file.url.split("/").pop()?.split(".")[0]; // Extrae el nombre del archivo de la URL
      } else if (file.filename) {
        publicId = file.filename;
      }
  
      if (!publicId) {
        console.log(`No se pudo determinar el public_id para el archivo ${file.type}`);
        return;
      }
  
      const folder = file.type === "image" ? "uploads" : "pdf";
      const resourceType = file.type === "image" ? "image" : "raw";

      const archivo = file.type === "image" ? `${folder}/${publicId}` : `${folder}/${publicId}.pdf`
  
      await cloudinary.uploader.destroy(archivo, { resource_type: resourceType });
      console.log(`${file.type === "image" ? "Imagen" : "PDF"} eliminado de Cloudinary: ${folder}/${publicId}`);
    } catch (error) {
      console.log(`Error al eliminar ${file.type} de Cloudinary:`, error);
    }
  };