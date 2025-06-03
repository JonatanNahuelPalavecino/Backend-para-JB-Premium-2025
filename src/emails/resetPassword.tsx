import { Html, Head, Body, Container, Text, Link } from "@react-email/components";

export const ResetPasswordEmail = ({ resetUrl }: { resetUrl: string }) => {
    return (
        <Html>
            <Head />
            <Body style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
                <Container>
                    <Text>Hola,</Text>
                    <Text>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</Text>
                    <Link href={resetUrl} style={{ color: "#007bff" }}>
                        Restablecer Contraseña
                    </Link>
                    <Text>Si no solicitaste esto, ignora este correo.</Text>
                </Container>
            </Body>
        </Html>
    );
};