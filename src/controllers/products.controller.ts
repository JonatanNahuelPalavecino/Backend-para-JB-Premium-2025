import { Request, Response } from "express";
import prisma from "../model/prisma.model";
import { Products } from "@prisma/client";
import {
  actualizarProducto,
  eliminarArchivo,
} from "../services/products.services";

export const getAllProductsByFilters = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { filters, page = 1, limit = 100 } = req.body;
  const skip = (page - 1) * limit;

  try {
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: { ...filters },
        skip,
        take: limit,
      }),
      prisma.products.count({
        where: { ...filters },
      }),
    ]);

    if (products.length === 0) {
      res.status(404).json({
        estado: "error",
        mensaje:
          "La busqueda no encontró resultados con los filtros establecidos.",
        products: [],
        total: 0,
      });
      return;
    }

    res.status(200).json({
      estado: "success",
      mensaje: "Busqueda realizada con exito.",
      products,
      total,
    });
  } catch (error) {
    console.log("Error en getAllProducts - products.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al traer los productos.",
    });
  }
};

export const getUniqueProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const product = res.locals.product;

  try {
    res.status(200).json({
      estado: "success",
      mensaje: "Producto traido con exito.",
      product,
    });
  } catch (error) {
    console.log("Error en getUniqueProduct - products.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al traer el producto.",
    });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    nombre,
    precio,
    stock_disponible,
    stock_total,
    activo,
    accesorio,
    porcDesc,
    destacado,
    bodega,
    cosecha,
    region,
    crianza,
    descUno,
    descDos,
    faseGus,
    faseOlf,
    faseVis,
    grado,
    maridaje,
    temp,
    tipo,
    ubicacion,
    vino,
    detalle,
    promocion,
  } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files["foto"]) {
    res
      .status(400)
      .json({ estado: "error", mensaje: "No se ha enviado ninguna imagen." });
    return;
  }

  try {
    const foto = files["foto"][0].path; // URL Cloudinary
    let pdf: string = "";
    let fotoPromo: string = "";

    if (files["pdf"]) {
      pdf = files["pdf"][0].path;
    }

    if (files["fotoPromo"]) {
      fotoPromo = files["fotoPromo"][0].path;
    }

    const product: Products = await prisma.products.create({
      data: {
        nombre,
        precio: parseFloat(precio),
        stock_disponible: parseInt(stock_disponible),
        stock_total: parseInt(stock_total),
        activo: activo === "true",
        accesorio: accesorio === "true",
        porcDesc: porcDesc === "" ? 0 : parseInt(porcDesc),
        destacado: destacado === "true",
        foto,
        fotoPromo, // <-- Asegurate de tener este campo en el modelo `Products`
        bodega,
        cosecha,
        region,
        crianza,
        descUno,
        descDos,
        faseGus,
        faseOlf,
        faseVis,
        grado,
        maridaje,
        temp,
        tipo,
        ubicacion,
        vino,
        detalle,
        promocion: promocion === "true",
        pdf,
      },
    });

    res.status(201).json({
      estado: "success",
      mensaje: "Producto creado con éxito",
      product,
    });
  } catch (error) {
    // Eliminar archivos si hubo un error
    if (files) {
      if (files["foto"]) {
        await eliminarArchivo({
          filename: files["foto"][0].filename,
          type: "image",
        });
      }

      if (files["fotoPromo"]) {
        await eliminarArchivo({
          filename: files["fotoPromo"][0].filename,
          type: "image",
        });
      }

      if (files["pdf"]) {
        await eliminarArchivo({
          filename: files["pdf"][0].filename,
          type: "pdf",
        });
      }
    }

    console.log("Error en createProduct - products.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al crear el producto.",
    });
  }
};

export const modifyUniqueProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productoId, nombre } = res.locals.product;
  const productoActual = res.locals.product;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  try {
    const updatedData: Partial<Products> = actualizarProducto(req.body);

    if (files && files["foto"]) {
      if (productoActual.foto) {
        await eliminarArchivo({ url: productoActual.foto, type: "image" });
      }
      updatedData.foto = files["foto"][0].path;
    }

    if (files && files["fotoPromo"]) {
      if (productoActual.fotoPromo) {
        await eliminarArchivo({ url: productoActual.fotoPromo, type: "image" });
      }
      updatedData.fotoPromo = files["fotoPromo"][0].path;
    }

    if (files && files["pdf"]) {
      if (productoActual.pdf && productoActual.pdf !== "") {
        await eliminarArchivo({ url: productoActual.pdf, type: "pdf" });
      }
      updatedData.pdf = files["pdf"][0].path;
    } else if (req.body.deletePdf && !files?.["pdf"]) {
      if (productoActual.pdf && productoActual.pdf !== "") {
        await eliminarArchivo({ url: productoActual.pdf, type: "pdf" });
        updatedData.pdf = "";
      }
    }

    // Verificar si hay algo que actualizar
    if (Object.keys(updatedData).length === 0) {
      res.status(400).json({
        estado: "error",
        mensaje: "No se proporcionaron datos para actualizar.",
      });
      return;
    }

    await prisma.products.update({
      where: { productoId },
      data: { ...updatedData },
    });

    res.status(201).json({
      estado: "success",
      mensaje: `El producto ${nombre} ha sido modificado con exito.`,
    });
  } catch (error) {
    console.log(
      "Error en order modifyUniqueProduct - products.controller - ",
      error
    );
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al intentar modificar el producto.",
    });
  }
};

export const deleteUniqueProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productoId, foto, pdf, nombre } = res.locals.product;

  try {
    if (foto) {
      await eliminarArchivo({ url: foto, type: "image" });
    }
    if (pdf && pdf !== "") {
      await eliminarArchivo({ url: pdf, type: "pdf" });
    }

    await prisma.products.delete({
      where: { productoId },
    });

    res.status(200).json({
      estado: "success",
      mensaje: `El producto ${nombre} ha sido eliminado.`,
    });
  } catch (error) {
    console.log(
      "Error en order deleteUniqueProduct - products.controller - ",
      error
    );
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al intentar eliminar el producto.",
    });
  }
};
