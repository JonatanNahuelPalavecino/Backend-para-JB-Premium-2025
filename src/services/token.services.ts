import { Users } from "@prisma/client"
import jwt from "jsonwebtoken"
import { desestructuringUsers } from "./desestructuringUser.services"

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret"

export const generateToken = (user: Users): string => {
    const userWithOutPass = desestructuringUsers([user])
    
    return jwt.sign({user: userWithOutPass}, JWT_SECRET, {expiresIn: '1h'})
}