import { Request, Response } from "express";
import prisma from "../model/prisma.model";
import { desestructuringUsers } from "../services/desestructuringUser.services";
import { Users } from "@prisma/client";
import {
  comparePassword,
  encryptPassword,
} from "../services/password.services";
import { generateToken } from "../services/token.services";
import { sendEmail } from "../services/sendEmail.services";
import { ResetPasswordEmail } from "../emails/resetPassword";
import jwt from "jsonwebtoken";

export const getAllUsersByFilters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = desestructuringUsers([res.locals.user]);
    const {filters} = req.body

    if (user[0]?.rol === "user" || !user) {
      res
        .status(401)
        .json({
          estado: "error",
          mensaje: "Su usuario no esta autorizado a visualizar usuarios.",
        });
      return;
    }

    const data = await prisma.users.findMany({
      where: {...filters},
      include: {
        orders: true
      }
    });

    res.status(200).json({
      estado: "success",
      mensaje: "Usuarios traidos con exito",
      users: data,
    });
  } catch (error) {
    console.log("Error en getAllUsers- user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al traer los usuarios.",
    });
  }
};

export const getUniqueUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = desestructuringUsers([res.locals.user]);

  if (user[0]?.rol === "user" || !user) {
    res
      .status(401)
      .json({
        estado: "error",
        mensaje: "Su usuario no esta autorizado a visualizar usuarios.",
      });
    return;
  }

  try {
    res
      .status(200)
      .json({ estado: "success", mensaje: "Usuario traido con exito.", user });
  } catch (error) {
    console.log("Error en getUniqueUser - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al traer el usuario.",
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user: Users | null = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      res
        .status(404)
        .json({ estado: "error", mensaje: "Usuario no encontrado." });
      return;
    } else if (!user.activo) {
      res
      .status(401)
      .json({ estado: "error", mensaje: "El usuario está desactivado." });
    return;
    }

    const passwordMatch = comparePassword(password, user.password);
    if (!passwordMatch) {
      res
        .status(401)
        .json({ estado: "error", mensaje: "Usuario o contraseña incorrecta." });
      return;
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 36000000,
    });

    const userWithOutPass = desestructuringUsers([user]);

    res.status(200).json({
      estado: "success",
      mensaje: "Inicio de sesión correcto",
      user: userWithOutPass,
    });
  } catch (error) {
    console.log("Error en loginUser - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al iniciar sesión.",
    });
  }
};

export const logOutUser = (req: Request, res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ estado: "success", mensaje: "Sesión cerrada correctamente" });
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { nombre, apellido, email, password, edad } = req.body;
  try {
    if (!nombre || !apellido || !email || !password) {
      res.status(400).json({
        estado: "error",
        mensaje: "Todos los campos son obligatorios.",
      });
      return;
    }

    if (!edad) {
      res.status(401).json({
        estado: "error",
        mensaje: "Debes de ingresar la edad.",
      });
      return;
    } else if (edad < 18) {
      res.status(401).json({
        estado: "error",
        mensaje: "No podes registrarte siendo menor de edad.",
      });
      return;
    }

    const verifyUser = await prisma.users.findUnique({
      where: {email}
    })

    if (verifyUser) {
      res.status(401).json({
        estado: "error",
        mensaje: "El email ya está en uso.",
      });
      return;
    }

    const passwordHash: string = encryptPassword(password);

    const user: Users | null = await prisma.users.create({
      data: { nombre, apellido, email, password: passwordHash, edad },
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 36000000,
    });

    const userWithOutPass = desestructuringUsers([user]);

    res.status(200).json({
      estado: "success",
      mensaje: "Registro de forma exitosa",
      user: userWithOutPass,
    });
  } catch (error) {
    console.log("Error en registerUser - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al registrar al usuario.",
    });
  }
};

export const desactivateUser = async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const {email} = req.body

  try {
    
    await prisma.users.update({
      where: {email},
      data: {activo: false}
    })

    if (user.email === email) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
    }

    res.status(201).json({
      estado: "success",
      mensaje: "Usuario desactivado con exito.",
    });

  } catch (error) {
    console.log("Error en desactivateUser - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al desactivar al usuario.",
    });
  }
}

export const activateUser = async (req: Request, res: Response): Promise<void> => {
  const {email} = req.body

  try {
    
    await prisma.users.update({
      where: {email},
      data: {activo: true}
    })

    res.status(201).json({
      estado: "success",
      mensaje: "Usuario activado con exito.",
    });

  } catch (error) {
    console.log("Error en activateUser - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al activar al usuario.",
    });
  }
}

export const confirmToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = res.locals.user;

  try {
    res.status(200).json({
      estado: "success",
      mensaje: "Token autenticado con exito.",
      user,
    });
  } catch (error) {
    console.log("Error en confirmTOken - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al autenticar el token.",
    });
  }
};

export const modifyUniqueUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = desestructuringUsers([res.locals.user]);
  const { nombre, apellido, email, password } = req.body.filters;

  if (email || password) {
    res.status(401).json({
      estado: "error",
      mensaje: "El email o password no puede modificarse en esta sección.",
    });
    return;
  }

  try {
    await prisma.users.update({
      where: { userId: user[0]?.userId },
      data: { nombre, apellido },
    });
    res
      .status(200)
      .json({ estado: "success", mensaje: "Usuario modificado con exito." });
  } catch (error) {
    console.log("Error en modifyUniqueUser - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al modificar el usuario.",
    });
  }
};

export const recorverPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const user: Users | null = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(401).json({ estado: "error", mensaje: "Usuario no encontrado" });
    return;
  }
  try {
    const token = generateToken(user);

    const resetUrl = `${process.env.URL_FRONTEND}/cambiar-password?token=${token}`;

    await sendEmail(
      [user.email],
      "Recupera tu contraseña - JB Premium",
      ResetPasswordEmail,
      { resetUrl }
    );

    res
      .status(200)
      .json({
        estado: "success",
        mensaje: "Correo enviado con exito.",
        resetUrl,
      });
  } catch (error) {
    console.log("Error en recoverPassword - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al recuperar la contraseña.",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      user: { userId: number }[];
    };
    const user = decoded.user[0];

    if (!user || !user.userId) {
      res.status(401).json({
        estado: "error",
        mensaje:
          "El token para editar la contraseña es inválido o ha expirado.",
      });
      return;
    }

    const passwordHash: string = encryptPassword(password);

    await prisma.users.update({
      where: { userId: user.userId },
      data: { password: passwordHash },
    });

    res.status(201).json({
      estado: "success",
      mensaje: "Contraseña editada con éxito.",
    });
  } catch (error) {
    console.error("Error en resetPassword - user.controller - ", error);
    res.status(500).json({
      estado: "error",
      mensaje: "Error en el servidor al modificar la contraseña.",
    });
  }
};
