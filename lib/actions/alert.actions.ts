"use server";

import { connectToDatabase } from "@/database/mongoose";
import Alert, { IAlert } from "@/database/models/alert.model";
import mongoose from "mongoose";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Type for creating an alert
export interface CreateAlertParams {
    symbol: string;
    companyName: string;
    alertName?: string; // Not stored in model yet, but usually useful. Model didn't have it, I'll stick to model for now or update model if needed. 
    // Wait, the modal has "Alert Name" input. I should probably add it to the model.
    // The user prompt screenshot shows "Alert Name".
    // I will update the model in a second step if strictly needed, but let's stick to what I defined or add it now?
    // Let's add it to the model to be safe. "Apple at Discount" is the example.
    // I'll update the model first, then this action.
    alertType: string;
    condition: string;
    threshold: number;
    frequency: string;
}

export async function createAlert(params: CreateAlertParams) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" };
        }

        await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) return { success: false, error: "Database error" };

        const userCollection = db.collection("user");
        const user = await userCollection.findOne({ email: session.user.email });

        if (!user) return { success: false, error: "User not found" };

        const userId = user._id.toString();

        await Alert.create({
            userId,
            symbol: params.symbol,
            companyName: params.companyName,
            alertName: params.alertName,
            alertType: params.alertType,
            condition: params.condition,
            threshold: params.threshold,
            frequency: params.frequency,
        });

        revalidatePath("/watchlist");
        return { success: true };
    } catch (error) {
        console.error("Error creating alert:", error);
        return { success: false, error: "Failed to create alert" };
    }
}

export async function getUserAlerts(email: string) {
    try {
        await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) return [];

        const userCollection = db.collection("user");
        const user = await userCollection.findOne({ email });

        if (!user) return [];

        const userId = user._id.toString();

        // Sort by newest first
        const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
        // Convert to plain objects
        return JSON.parse(JSON.stringify(alerts));
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return [];
    }
}

export async function deleteAlert(alertId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" };
        }

        await connectToDatabase();

        // Security check: ensure alert belongs to user
        const db = mongoose.connection.db;
        if (!db) return { success: false, error: "Database error" };
        const userCollection = db.collection("user");
        const user = await userCollection.findOne({ email: session.user.email });
        if (!user) return { success: false, error: "User not found" };
        const userId = user._id.toString();

        const result = await Alert.deleteOne({ _id: alertId, userId });

        if (result.deletedCount === 0) {
            return { success: false, error: "Alert not found or unauthorized" };
        }

        revalidatePath("/watchlist");
        return { success: true };
    } catch (error) {
        console.error("Error deleting alert:", error);
        return { success: false, error: "Failed to delete alert" };
    }
}
