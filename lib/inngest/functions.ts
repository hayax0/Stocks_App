import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT } from "./prompts";
import { sendWelcomeEmail, sendNewsSummaryEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.actions";

// Função 1: Email de Boas-vindas (Mantida igual, apenas formatada)
export const sendSingUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }) => {
        const userProfile = `
    - Country: ${event.data.country}
    - Investment goals: ${event.data.investmentGoals}
    - Risk tolerance: ${event.data.riskTolerance}
    - Preferred industries: ${event.data.preferredIndustries}
    `;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", userProfile);

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ]
            }
        });

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0].content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for signing up! You now have access to our stock market analysis tools.';

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        });

        return {
            success: true,
            message: 'Welcome email sent successfully',
        };
    }
);

// Função 2: Resumo Diário de Notícias (CORRIGIDA)
export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'send-daily-news-summary' },
    [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }],
    async ({ step }) => {

        // Step 1: Get all users
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);

        if (!users || users.length === 0) {
            return { success: false, message: 'No users found', };
        }

        let emailsSent = 0;

        for (const user of users) {
            // AJUSTE: Removemos o step.run "pai" (process-user) que causava o erro.
            // Agora os passos são irmãos e usam o ID do usuário para serem únicos.

            // Step 2: Fetch watchlist and news
            const newsData = await step.run(`fetch-news-${user.id}`, async () => {
                const { getWatchlistSymbolsByEmail } = await import("@/lib/actions/watchlist.actions");
                const { getNews } = await import("@/lib/actions/finnhub.actions");

                const symbols = await getWatchlistSymbolsByEmail(user.email);
                const news = await getNews(symbols);
                return news;
            });

            // Se não tiver notícias, pula esse usuário para economizar IA
            if (!newsData || newsData.length === 0) {
                continue;
            }

            // Step 3: Summarize news via AI
            // O ID do step deve ser único por iteração do loop -> `generate-news-summary-${user.id}`
            const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace("{{newsData}}", JSON.stringify(newsData));

            const response = await step.ai.infer(`generate-news-summary-${user.id}`, {
                model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                body: {
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }]
                        }
                    ]
                }
            });

            const part = response.candidates?.[0].content?.parts?.[0];
            const userNewsSummary = (part && 'text' in part ? part.text : null) || 'No summary available.';

            // Step 4: Send the emails
            await step.run(`send-news-email-${user.id}`, async () => {
                await sendNewsSummaryEmail({
                    email: user.email,
                    date: new Date().toDateString(),
                    newsContent: userNewsSummary
                });
            });

            emailsSent++;
        }

        return { success: true, message: `News summary email sent successfully to ${emailsSent} users` };
    }
);