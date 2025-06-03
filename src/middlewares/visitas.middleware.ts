import { Visitas } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../model/prisma.model";

export const getVisitByFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { filters } = req.body;

  try {
    const visit: Visitas[] | null = await prisma.visitas.findMany({
      where: { ...filters },
    });

    res.locals.filters = filters;
    res.locals.visit = visit;
    next();
  } catch (error) {
    console.error("Error en getVisitByFilters - visitas.middleware", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Hubo un error con el servidor al traer la visita.",
    });
  }
};

type VisitaExtendida = Visitas & {
  productoNombre: string | null;
};

export const getProductInVisit = async (visitas: Visitas[]): Promise<VisitaExtendida[]> => {
  const visitasProcesadas = await Promise.all(
    visitas.map(async (visit) => {
      const detalleRegex = /^\/detalle\/(\d+)$/;
      const match = visit.ruta.match(detalleRegex);

      if (match) {
        const productoId = parseInt(match[1]);
        const producto = await prisma.products.findUnique({
          where: { productoId },
          select: { nombre: true },
        });

        return {
          ...visit,
          productoNombre: producto ? producto.nombre : null,
        };
      } else {
        return {
          ...visit,
          productoNombre: null,
        };
      }
    })
  );

  return visitasProcesadas;
};
