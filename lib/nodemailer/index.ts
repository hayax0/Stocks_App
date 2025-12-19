import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE } from './templates';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailsOpitions = {
        from: `"Signalist" <signalist@signalist.com>`,
        to: email,
        subject: 'Welcome to Signalist',
        text: 'Thanks for signing up to Signalist!',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailsOpitions);
}

