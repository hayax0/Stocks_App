"use server";

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";
import mongoose from "mongoose";

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
