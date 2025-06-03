import expres from "express"
import { addVisit, countVisit, getAllVisit, getUniqueVisit } from "../controllers/visitas.controller"
import { getVisitByFilters } from "../middlewares/visitas.middleware"
import { verifyToken } from "../middlewares/user.middleware"
import { verifyRole } from "../middlewares/roles.middleware"
import { UserAllowed } from "../enums/user.enum"
import { Messages } from "../enums/mensajes.enum"

const router = expres.Router()

router.get("/get-all-visits", verifyToken, verifyRole(UserAllowed.admin, Messages.watchVisit), getAllVisit)

router.post("/total", verifyToken, verifyRole(UserAllowed.admin, Messages.watchVisit), countVisit)

router.post("/get-visit", verifyToken, verifyRole(UserAllowed.admin, Messages.watchVisits), getVisitByFilters, getUniqueVisit)

router.post("/", getVisitByFilters, addVisit)

export default router