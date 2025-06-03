import { render } from "@react-email/render";
import { Resend } from "resend";
import React from "react";

export const sendEmail = async <T extends Record<string, any>>(
    email: Array<string>,
    subject: string,
    Template: React.FC<T>,
    props: T
) => {

    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        throw Error("Falta la variable de entorno de RESEND")
    }

    const resend = new Resend(apiKey);

    try {
        
        const emailHtml = await render(React.createElement(Template, props));

        await resend.emails.send({
            from: "remitente@resend.dev",
            to: email,
            subject,
            html: emailHtml,
        });

        console.log(`Correo enviado a ${email}`);
    } catch (error) {
        console.error("Error enviando email:", error);
    }
};
