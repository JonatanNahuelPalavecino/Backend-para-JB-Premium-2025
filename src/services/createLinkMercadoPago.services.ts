import MercadoPagoConfig, { Preference } from "mercadopago"
import { createBodyPreference } from "./createBodyPreference.services"

export interface LinkMercadoPago {
    estado: string,
    mensaje: string,
    link?: string
}

export const createLinkMercadoPago = async (total: number, orderId: string): Promise<LinkMercadoPago> => {

    const token = process.env.MERCADOPAGO_TOKEN || "token"

    const client = new MercadoPagoConfig({
        accessToken: token,
        options: { timeout: 5000, idempotencyKey: process.env.IDEMPOTENCY}
    })

    const preference = new Preference(client)

    const body = createBodyPreference(total, orderId)

    try {
        const data = await preference.create({body})
        return {estado: "success", mensaje: "Link generado con exito", link: data.init_point || ""}
    } catch (error) {
        console.error("Error en createLinkMercadoPago - createLinkMercadoPago.services - ", error);
        return { estado: "error", mensaje: "Hubo un problema con la creación de la orden" };
    }
}