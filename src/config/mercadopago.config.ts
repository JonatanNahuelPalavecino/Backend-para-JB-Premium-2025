import MercadoPagoConfig, { Preference } from "mercadopago";
import { createBodyPreference } from "../services/createBodyPreference.services";

export const createLink = async (totalCompra: number, idOrder: string): Promise<object> => {
  const token = process.env.MERCADOPAGO_TOKEN || "token";

  const client = new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 5000, idempotencyKey: process.env.IDEMPOTENCY },
  });

  const preference = new Preference(client);

  const body = createBodyPreference(totalCompra, idOrder)

  try {
    const data = await preference.create({ body });
    return { link: data.init_point || data};
  } catch (error) {
    console.error(error);
    return { error: "Hubo un problema con la creación de la orden" };
  }
};
