'use server';

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

// --- FUNÇÃO DE CADASTRO (SIGN UP) ---
export const signUpWithEmail = async ({
    email,
    password,
    fullName,
    country,
    investmentGoals,
    riskTolerance,
    preferredIndustry,
}: {
    email: string
    password: string
    fullName: string
    country: string
    investmentGoals: string
    riskTolerance: string
    preferredIndustry: string
}) => {
    try {

        const response = await auth.api.signUpEmail({
            body: { email, password, name: fullName }
        });

        if (response) {

            await inngest.send({
                name: 'app/user.created',
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry,
                },
            });


            await auth.api.signInEmail({
                body: { email, password }
            });


            return { success: true };
        }

        return { success: false, error: 'Sign up failed' };

    } catch (error) {
        console.log('Sign up failed', error);
        return { success: false, error: 'Sign up failed' };
    }
};

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
        return { success: true };
    } catch (error) {
        console.log('Sign out failed', error);
        return { success: false, error: 'Sign out failed' };
    }
}

// --- FUNÇÃO DE LOGIN (SIGN IN) ---
export const signInWithEmail = async ({
    email,
    password,
}: {
    email: string
    password: string
}) => {
    try {
        const response = await auth.api.signInEmail({
            body: { email, password }
        });


        return { success: true };

    } catch (error) {
        console.log('Sign in failed', error);
        return { success: false, error: 'Sign in failed' };
    }
};