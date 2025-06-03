import { Users } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../model/prisma.model";
import jwt from "jsonwebtoken";

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = parseInt(req.params.id);

  try {
    const user: Users | null = await prisma.users.findUnique({
      where: { userId },
    });

    if (!user) {
      res
        .status(400)
        .json({ estado: "error", mensaje: "El usuario no existe." });
      return;
    }

    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Error en getUserById - user.middleware:", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error interno del servidor al traer el usuario.",
    });
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";

  try {
    const token = req.cookies.token;

    if (!token) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.status(403).send({
        estado: "error",
        mensaje: "No existe token o falta autorización",
      });
      return;
    }

    jwt.verify(token, JWT_SECRET, (error: any, decoded: any) => {
      if (error) {
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        res.status(401).send({
          estado: "error",
          mensaje: "Sesión cerrada. Token vencido o inválido",
        });
        return;
      }

      res.locals.user = decoded.user;

      next();
    });
  } catch (error) {
    console.error("Error en verifyToken - user.middleware:", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error interno del servidor al verificar el token.",
    });
  }
};
