"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { PriceAlertModal } from "./PriceAlertModal";
import { WatchlistData } from "@/lib/actions/finnhub.actions";
import { deleteAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AlertItem {
    _id: string;
    symbol: string;
    companyName: string;
    alertName?: string;
    alertType: string;
    condition: string;
    threshold: number;
    frequency: string;
}

interface WatchlistAlertsProps {
    watchlist: WatchlistData[];
    alerts?: AlertItem[];
}

const WatchlistAlerts = ({ watchlist = [], alerts = [] }: WatchlistAlertsProps) => {
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const result = await deleteAlert(id);
            if (result.success) {
                toast.success("Alert deleted");
                // The revalidatePath in server action should handle this, 
                // but explicit refresh helps ensure client state sync
                router.refresh();
            } else {
                toast.error("Failed to delete alert");
            }
        } catch (error) {
            toast.error("Error deleting alert");
        } finally {
            setDeletingId(null);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Alerts</h2>
                <Button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="bg-[#FCA311] hover:bg-[#e0910f] text-black font-semibold"
                >
                    Create Alert
                </Button>
            </div>

            <div className="flex flex-col gap-3">
                {alerts.length === 0 ? (
                    <div className="text-gray-500 text-center py-10 bg-[#1E1E1E]/30 rounded-xl border border-white/5">
                        No alerts created yet.
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const stockData = watchlist.find(w => w.symbol === alert.symbol);
                        const price = stockData?.price || 0;
                        const changePercent = stockData?.changePercent || 0;
                        const logoUrl = stockData?.logo;

                        // Formatting helpers
                        const displayCondition = alert.condition === 'greater_than' ? '>' : alert.condition === 'less_than' ? '<' : '=';
                        const displayFrequency = alert.frequency === 'daily' ? 'Once per day' : alert.frequency === 'once' ? 'Once' : 'Always';

                        return (
                            <div
                                key={alert._id}
                                className="p-4 rounded-xl border border-white/10 bg-[#1E1E1E]/50 flex flex-col gap-3"
                            >
                                {/* Top Row: Icon, Name/Price */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center p-2 overflow-hidden bg-white/10">
                                            {logoUrl ? (
                                                <img
                                                    src={logoUrl}
                                                    alt={alert.companyName}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-white">{alert.symbol.substring(0, 2)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">
                                                {alert.companyName}
                                            </h3>
                                            <div className="text-sm font-medium text-white">
                                                {formatCurrency(price)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-xs text-gray-400 font-bold">
                                            {alert.symbol}
                                        </div>
                                        <div
                                            className={`text-sm font-bold ${changePercent >= 0
                                                ? "text-[#4CC38A]"
                                                : "text-[#E63946]"
                                                }`}
                                        >
                                            {changePercent > 0 ? "+" : ""}{changePercent.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 w-full" />

                                {/* Bottom Row: Condition, Edit/Delete, Frequency */}
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-400">Alert:</span>
                                        <span className="text-sm font-bold text-white">
                                            Price {displayCondition} {formatCurrency(alert.threshold)}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete(alert._id)}
                                                disabled={deletingId === alert._id}
                                                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                title="Delete Alert"
                                            >
                                                {deletingId === alert._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                        <Badge className="bg-[#3D2F00] text-[#FCA311] hover:bg-[#3D2F00] border-none font-normal text-[10px] px-2 py-0.5 whitespace-nowrap">
                                            {displayFrequency}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <PriceAlertModal
                open={isAlertModalOpen}
                onOpenChange={setIsAlertModalOpen}
                watchlist={watchlist}
            />
        </div>
    );
};

export default WatchlistAlerts;
