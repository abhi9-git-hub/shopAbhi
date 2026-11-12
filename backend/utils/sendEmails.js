import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
    const { EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) {
        throw new Error('Email is not configured. Set EMAIL_USER and EMAIL_PASS.');
    }

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
    const mailOptions = {
        from: EMAIL_USER,
        to,
        subject,
        text
    };
    await transporter.sendMail(mailOptions);
};

export default sendEmail;