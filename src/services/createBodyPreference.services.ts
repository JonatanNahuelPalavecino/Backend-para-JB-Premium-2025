export const createBodyPreference = (totalCompra: number, orderId: string) => ({
    items: [
      {
        id: "1",
        title: "JB Premium",
        description: "Vinos Españoles",
        picture_url: "https://res.cloudinary.com/dabgfr6qn/image/upload/v1742325732/uploads/logo.png",
        quantity: 1,
        currency_id: "ARS",
        unit_price: totalCompra,
      },
    ],
    back_urls: {
      success: "http://localhost:5173/pago-realizado",
      failure: "http://localhost:5173/pago-rechazado",
      pending: "http://localhost:5173/pago-pendiente",
    },
    notification_url: `${process.env.URL_SERVER}/transactions/webhook`,
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [{ id: "ticket" }],
      installments: 12,
    },
    external_reference: orderId,
    // auto_return: "approved"
    //No usar hasta que los URLS de las back_urls sean https
  });
  