"use server";

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";
import mongoose from "mongoose";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    try {
        await connectToDatabase();

        const db = mongoose.connection.db;
        if (!db) {
            console.error("Database connection not established.");
            return [];
        }

        const userCollection = db.collection("user");
        const user = await userCollection.findOne({ email: email });

        if (!user) {
            console.log(`User not found with email: ${email}`);
            return [];
        }

        const userId = user._id.toString();

        const watchlistItems = await Watchlist.find({ userId }).select("symbol");

        return watchlistItems.map((item) => item.symbol);
    } catch (error) {
        console.error("Error fetching watchlist symbols:", error);
        return [];
    }
}

export async function toggleWatchlistSymbol(symbol: string, company: string): Promise<{ success: boolean; isAdded?: boolean; error?: string }> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" };
        }

        await connectToDatabase();

        // Find user to get ID (consistent with getWatchlistSymbolsByEmail)
        const db = mongoose.connection.db;
        if (!db) return { success: false, error: "Database error" };

        const userCollection = db.collection("user");
        const user = await userCollection.findOne({ email: session.user.email });

        if (!user) return { success: false, error: "User not found" };

        const userId = user._id.toString();

        const existingItem = await Watchlist.findOne({ userId, symbol });

        if (existingItem) {
            await Watchlist.deleteOne({ _id: existingItem._id });
            revalidatePath('/watchlist');
            return { success: true, isAdded: false };
        } else {
            await Watchlist.create({
                userId,
                symbol,
                company
            });
            revalidatePath('/watchlist');
            return { success: true, isAdded: true };
        }

    } catch (error) {
        console.error("Error toggling watchlist item:", error);
        return { success: false, error: "Internal server error" };
    }
}
// --- HELPER WRAPPER PARA CLIENT COMPONENTS ---
export async function getParamsUserWatchlist(): Promise<string[]> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return [];
        }

        return await getWatchlistSymbolsByEmail(session.user.email);
    } catch (error) {
        return [];
    }
}
