import { Request, Response } from "express";
import prisma from "../model/prisma.model";
import { aumentarStockDisponible, disminuirStockDisponible, disminuirStockTotal } from "../services/products.services";
import { getRejectedOrPendingTransactions, getTransaction } from "../services/transactions.services";

export const processPayment = async (req: Request, res: Response): Promise<void> => {
    
    const { transaction } = res.locals;
  
    try {
      const existeTransaccion = await getTransaction(transaction?.transaccionId || 0)
  
      if (existeTransaccion) {
        res.status(400).json({ estado: "error", message: `Ya se registró la transaccion ID ${transaction?.transaccionId}`});
        return
      }
      const order = await prisma.order.findUnique({
        where: { orderId: transaction?.orderId },
        include: { items: true },
      });
  
      if (!order) {
        res.status(400).json({ estado: "error", message: `No se encontró la orden con ID ${transaction?.transaccionId}`});
        return
      }
  
      await prisma.order.update({
        where: { orderId: transaction?.orderId },
        data: { estado: transaction?.estado },
      });
  
      const transaccionesRechazadasOPendientes = await getRejectedOrPendingTransactions(transaction?.orderId || '')

  
      await prisma.transactions.create({
        data: {...transaction},
      });
      
      //SI LA TRANSACCION VIENE APROBADA PERO FUE RECHAZADA ANTERIORMENTE
      if (transaction?.estado === "approved" && transaccionesRechazadasOPendientes) {
        disminuirStockDisponible(order.items)
        disminuirStockTotal(order.items)
      //SI LA TRANSACCION VIENE RECHAZADA O PENDIENTE Y TENIA YA RECHAZOS ANTERIORES
      } else if ((transaction?.estado === "rejected" || transaction?.estado === "in_process") && transaccionesRechazadasOPendientes) {
        return
      //SI LA TRANSACCION FUE RECHAZADA O PENDIENTE POR PRIMERA VEZ
      } else if ((transaction?.estado === "rejected" || transaction?.estado === "in_process")) {
        aumentarStockDisponible(order.items)
      //SI LA TRANSACCION FUE APROBADA POR PRIMERA VEZ
      } else if (transaction?.estado === "approved") {
        disminuirStockTotal(order.items)
      }
  
    } catch (error) {
      console.error("Error al crear la transaccion:", error);
      res.status(500).json({ error: "Error al procesar la transaccion" });
    };
  };
  
export const getTrangetTransactionsByFilters = async (req: Request, res: Response): Promise<void> => {

  const {filters} = req.body

  try {
    const transactions = await prisma.transactions.findMany({
      where: {...filters}
    })

    const tx = transactions.map(t => ({...t, transaccionId: t.transaccionId.toString()}))

    res.status(200).json({estado: "success", mensaje: "Transacciones conseguidas con exito", transactions: tx})
  } catch (error) {
    console.log(
      "Error en transactions getTransactionsByFilters - transactions.controller - ",
      error
    );
    res
      .status(500)
      .json({
        estado: "error",
        mensaje: "Error en el servidor al intentar conseguir las transacciones.",
      });
  }
}