import express from "express";
import { getTrangetTransactionsByFilters, processPayment } from "../controllers/transactions.controller";
import { receiveWebhook } from "../middlewares/transactions.middleware";
import { verifyToken } from "../middlewares/user.middleware";
import { verifyRole } from "../middlewares/roles.middleware";
import { UserAllowed } from "../enums/user.enum";
import { Messages } from "../enums/mensajes.enum";

const router = express.Router();

//getPayment from WebHook
router.post("/webhook", receiveWebhook, processPayment)

//ver las transacciones
router.post("/", verifyToken, verifyRole(UserAllowed.admin, Messages.watchTransactions), getTrangetTransactionsByFilters)

export default router