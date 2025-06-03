import { render } from "@react-email/render";
import { Resend } from "resend";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async <T extends Record<string, any>>(
    email: Array<string>,
    subject: string,
    Template: React.FC<T>,
    props: T
) => {

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
