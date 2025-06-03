import express from "express"
import dotenv from "dotenv"
import orderRouter from "./routes/order.routes"
import productRouter from "./routes/products.routes"
import userRouter from "./routes/user.routes"
import visitRouter from "./routes/visitas.routes"
import transactionsRouter from "./routes/transactions.routes"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()

//Middlewares
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)

//Routes
app.use("/order", orderRouter)
app.use("/products", productRouter)
app.use("/user", userRouter)
app.use("/visit", visitRouter)
app.use("/transactions", transactionsRouter)

//Export
export default app

//FALTA CONFIGURAR LA LOGICA DE DESACTIVAR Y ACTIVAR UN USUARIO EN EL FRONTEND Y EL BACKEND

//FALTA CONFIGURAR EL ENVIO DE MAIL EN CASI TODOS LOS CASOS; POR EJEMPLO

//REGISTRO DE USUARIO -> PARA EL USER Y EL ADMIN
//SOLICITUD DE RESETEO DE PASSWORD   HECHO!
//CREACION, ELIMINACION O MODIFICACION DE ORDEN DE COMPRA -> PARA EL USER
//ESTADO DEL PAGO -> PARA EL USER
//PAGO SATISFACTORIO DE UNA ORDEN -> PARA EL ADMIN Y EL USER
