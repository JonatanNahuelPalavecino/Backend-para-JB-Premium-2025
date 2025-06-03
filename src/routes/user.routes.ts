import express from "express"
import { activateUser, confirmToken, desactivateUser, getAllUsersByFilters, getUniqueUser, loginUser, logOutUser, modifyUniqueUser, recorverPassword, registerUser, resetPassword } from "../controllers/user.controller"
import { getUserById, verifyToken } from "../middlewares/user.middleware"
import { verifyRole } from "../middlewares/roles.middleware"
import { UserAllowed } from "../enums/user.enum"
import { Messages } from "../enums/mensajes.enum"

const router = express.Router()

//getAllUsers
router.post("/getUsers", verifyToken, verifyRole(UserAllowed.admin, Messages.watchUsers), getAllUsersByFilters)

//getUserById
router.post("/getUser/:id", verifyToken, verifyRole(UserAllowed.admin, Messages.watchUser), getUserById, getUniqueUser)

//login
router.post("/login", loginUser)

//register 
router.post("/register", registerUser)

//logout 
router.post("/logout", logOutUser)

//verifyToken
router.get("/protected", verifyToken, confirmToken)

//putUser
router.put("/editUser/:id", verifyToken, getUserById, modifyUniqueUser)

//getTokenForRecoverPassword
router.post("/recover-pass", recorverPassword)

//changePassword
router.patch("/change-pass", resetPassword)

//activateuser
router.patch("/activate-user", activateUser)

//desactivateuser
router.patch("/desactivate-user", verifyToken, desactivateUser)



export default router