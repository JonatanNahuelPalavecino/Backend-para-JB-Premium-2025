import { NextFunction, Request, Response } from "express";

export const verifyRole = (rolPermitido: String, mensaje: String) => {

    return (req: Request, res: Response, next: NextFunction) => {

        const user = res.locals.user
    
        if (user[0].rol !== rolPermitido || !user) {
            res.status(401).json({estado: "error", mensaje})
            return
        }

        next()
    }

}
//VERIFICAR TODOS LOS CONTROLLERS Y EN LO QUE SE UTILIZA EL CONDICIONAL ROL === USER ELIMINARLO Y AGREGAR ESTE MIDDLEWARE A LA RUTA Y TESTEARLO