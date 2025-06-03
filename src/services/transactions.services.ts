import prisma from "../model/prisma.model"

export const getTransaction = async (transaccionId: number): Promise<object | null> => {
    const transaccion = await prisma.transactions.findUnique({
        where: {transaccionId}
    })

    return transaccion || null

}

export const getRejectedOrPendingTransactions = async (orderId: string): Promise<boolean> => {
    const transacciones = await prisma.transactions.findMany({
        where: {orderId}
    })

    return transacciones.some(t => t.estado === "rejected" || t.estado === "in_process" || t.estado === "pending")
}