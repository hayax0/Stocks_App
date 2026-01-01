import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from './templates';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // Agora volta a usar as variáveis (já que arrumamos o .env)
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export const sendWelcomeEmail = async ({ email, name, intro }: any) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Signalist" <${process.env.NODEMAILER_EMAIL}>`, // Segurança aqui também
        to: email,
        subject: 'Welcome to Signalist',
        text: 'Thanks for signing up to Signalist!',
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({ email, date, newsContent }: { email: string, date: string, newsContent: string }) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Signalist News" <${process.env.NODEMAILER_EMAIL}>`, // Segurança aqui também
        to: email,
        subject: `Market News Summary Today - ${date}`,
        text: `Today's market news summary from Signalist`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};