import { Order, Users } from "@prisma/client";

type UserWithoutPassword = Omit<Users, "password" | "edad"> & {
    orders?: Order[]
}

export const desestructuringUsers = (data: Users[]): UserWithoutPassword[] => {
    return data.map((user: UserWithoutPassword) => ({
        userId: user.userId,
        email:user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        orders: user.orders,
        activo: user.activo
    }))
}