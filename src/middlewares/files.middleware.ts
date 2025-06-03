import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config";
import { changeName } from "../services/chageName";
import { NextFunction, Request, Response } from "express";

const MAX_SIZE = 10 * 1024 * 1024;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = file.originalname.split(".")[0];

    if (file.fieldname === "pdf") {
      return {
        folder: "pdf",
        resource_type: "raw",
        public_id: changeName(file.originalname),
      };
    }

    if (file.fieldname === "fotoPromo") {
      return {
        folder: "promos",
        format: "png",
        public_id: originalName,
      };
    }

    // Default: "foto"
    return {
      folder: "uploads",
      format: "png",
      public_id: originalName,
    };
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.fieldname === "foto" && file.mimetype !== "image/png") {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `El archivo '${file.fieldname}' debe ser en formato PNG.`
      )
    );
  }

  if (file.fieldname === "fotoPromo" && file.mimetype !== "image/png") {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `El archivo '${file.fieldname}' debe ser en formato PNG.`
      )
    );
  }

  if (file.fieldname === "pdf" && file.mimetype !== "application/pdf") {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `El archivo '${file.fieldname}' debe ser en formato PDF.`
      )
    );
  }

  cb(null, true);
};

export const savedFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).fields([
  { name: "foto", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "fotoPromo", maxCount: 1 },
]);

export const upload = (req: Request, res: Response, next: NextFunction) => {
  savedFiles(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          estado: "error",
          mensaje: `Archivo no válido: ${error.field}`,
        });
      } else if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          estado: "error",
          mensaje: "El tamaño del archivo debe ser menor a 10MB.",
        });
      } else {
        return res.status(400).json({
          estado: "error",
          mensaje: "Hubo un error al procesar los archivos.",
        });
      }
    } else if (error) {
      console.log(error);
      return res.status(400).json({
        estado: "error",
        mensaje: "Error al procesar los archivos.",
      });
    }

    next();
  });
};
