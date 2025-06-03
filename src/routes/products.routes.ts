import express from "express";
import { createProduct, deleteUniqueProduct, getAllProductsByFilters, getUniqueProduct, modifyUniqueProduct } from "../controllers/products.controller";
import { getProductById } from "../middlewares/products.middleware";
import { upload } from "../middlewares/files.middleware";
import { verifyToken } from "../middlewares/user.middleware";
import { verifyRole } from "../middlewares/roles.middleware";
import { UserAllowed } from "../enums/user.enum";
import { Messages } from "../enums/mensajes.enum";

const router = express.Router()

//getProductById
router.get("/:id", getProductById, getUniqueProduct)

//getAllProductsByFilters
router.post("/filters", getAllProductsByFilters)

//createProduct
router.post("/", verifyToken, verifyRole(UserAllowed.admin, Messages.createProduct), upload, createProduct)

//putProduct
router.put("/:id", verifyToken, verifyRole(UserAllowed.admin, Messages.editProduct), upload, getProductById, modifyUniqueProduct)

//deleteProduct
router.delete("/:id", verifyToken, verifyRole(UserAllowed.admin, Messages.deleteProduct), getProductById, deleteUniqueProduct)

export default router