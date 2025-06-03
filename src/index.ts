import app from "./app";

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`El servidor esta corriendo en el puerto ${PORT}`)
})