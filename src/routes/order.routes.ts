import express from "express"
import { createOrder, deleteUniqueOrder, getAllOrdersByfilters, getUniqueOrder, modifyUniqueOrder } from "../controllers/order.controller"
import {getOrderById} from "../middlewares/order.middleware"
import { verifyToken } from "../middlewares/user.middleware"

const router = express.Router()

//getOrderById
router.get("/:id", getOrderById, getUniqueOrder)

//getAllOrdersByFilters
router.post("/filters", getAllOrdersByfilters)

//createOrder
router.post("/", verifyToken, createOrder)

//putOrder
router.put("/:id", getOrderById, verifyToken, modifyUniqueOrder)

//deleteOrder
router.delete("/:id", getOrderById, verifyToken, deleteUniqueOrder)

export default router