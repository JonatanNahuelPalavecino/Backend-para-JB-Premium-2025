import { Request, Response } from "express";
import prisma from "../model/prisma.model";
import dayjs from "dayjs";
import { Visitas } from "@prisma/client";
import { getProductInVisit } from "../middlewares/visitas.middleware";

export const getAllVisit = async (req: Request, res: Response): Promise<void> => {
  try {
      const visits = await prisma.visitas.findMany({
        include: {
          user: { select: { email: true } },
        },
      })

      const visitasConProducto = await getProductInVisit(visits);
      res.status(200).json({estado: "success", mensaje: "Visitas traidas con exito.", visits: visitasConProducto})
  } catch (error) {
      console.log("Error en getAllVisit - visitas.controller - ", error)
      res.status(500).json({estado: "error", mensaje: "Error en el servidor al traer las visitas."})
  }
}

export const getUniqueVisit = async (req: Request, res: Response): Promise<void> => {
  const visit = res.locals.visit

  try {
      res.status(200).json({estado: "success", mensaje: "Visita traida con exito.", visit})
  } catch (error) {
      console.log("Error en getUniqueVisit - visitas.controller - ", error)
      res.status(500).json({estado: "error", mensaje: "Error en el servidor al traer la visita."})
  }
}

export const countVisit = async (req: Request, res: Response): Promise<void> => {

  const {filters} = req.body

  try {
    const total = await prisma.visitas.count({
      where: {...filters}
    })

    res.status(200).json({estado: "success", mensaje: "Total de visitas traido con exito", total})
  } catch (error) {
    console.error("Error en countVisit - visitas.controller", error);
    res.status(500).json({ estado: "error", mensaje: "Hubo un error con el servidor al contar las visitas." });
  }
}

export const addVisit = async (req: Request, res: Response): Promise<void> => {
  const { ip, user_agent, ruta, userId, referer } = res.locals.filters;
  const visit = res.locals.visit

  const hoy = dayjs(); 

  const visitadoHoy = visit.find((v: Visitas) =>
    dayjs(v.fecha).isSame(hoy, "day")
  );

  if (visitadoHoy) {
    res.status(401).json({ mensaje: "Visita ya registrada." });
    return;
  }

  try {

    await prisma.visitas.create({
      data: { ip, user_agent, ruta, userId, referer },
    });

    res
      .status(200)
      .json({ estado: "success", mensaje: "Visita registrada con exito." });
  } catch (error) {
    console.error("Error en addVisit - visitas.controller", error);
    res.status(500).json({ estado: "error", mensaje: "Hubo un error con el servidor al registrar la visita." });
  }
};
