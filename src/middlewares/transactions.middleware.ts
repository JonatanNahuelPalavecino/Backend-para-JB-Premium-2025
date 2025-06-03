import { Response, Request, NextFunction } from "express";

export const receiveWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const payment = req.query as { type: string; "data.id": string };

  if (payment.type !== "payment") {
    console.log("No es un Hook de tipo payment");
    res.status(400).json({ estado: "error", mensaje: "Webhook no procesado" });
    return;
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${payment["data.id"]}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MERCADOPAGO_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Error al obtener la compra: ${response.status} - ${response.statusText}`
      );
      res
        .status(500)
        .json({ message: "Error al obtener datos de MercadoPago" });
      return;
    }

    const data = await response.json();

    res.locals.transaction = {
      transaccionId: data.id,
      orderId: data.external_reference,
      tarjeta: data.payment_method_id,
      tipoDeTarjeta: data.payment_type_id,
      estado: data.status,
      detalleDelPago: data.status_detail,
      pagoRecibido: data.transaction_details.net_received_amount,
      pagoBruto: data.transaction_details.total_paid_amount,
    };

    next();
  } catch (error) {
    console.error("Error en receiveWebhook - transactions.middleware:", error);
    res
      .status(500)
      .json({
        estado: "error",
        mensaje: "Error interno del servidor con la respuesta del webHook",
      });
  }
};
