"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { WatchlistData } from "@/lib/actions/finnhub.actions";
import { createAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PriceAlertModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    watchlist: WatchlistData[];
    preselectedSymbol?: string;
    onCreateAlert?: (alertData: any) => void;
}

export function PriceAlertModal({
    open,
    onOpenChange,
    watchlist,
    preselectedSymbol,
    onCreateAlert,
}: PriceAlertModalProps) {
    const [symbol, setSymbol] = useState(preselectedSymbol || "");
    const [alertName, setAlertName] = useState("");
    const [alertType, setAlertType] = useState("price");
    const [condition, setCondition] = useState("greater_than");
    const [threshold, setThreshold] = useState("");
    const [frequency, setFrequency] = useState("once");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (preselectedSymbol) {
            setSymbol(preselectedSymbol);
        }
    }, [preselectedSymbol]);

    useEffect(() => {
        if (symbol && !alertName) {
            const stock = watchlist.find(w => w.symbol === symbol);
            if (stock) {
                setAlertName(`${stock.name || symbol} Alert`);
            }
        }
    }, [symbol, watchlist, alertName]);


    const handleSubmit = async () => {
        if (!symbol || !threshold || !alertName) {
            toast.error("Please fill in all required fields");
            return;
        }

        const selectedStock = watchlist.find(w => w.symbol === symbol);
        const companyName = selectedStock?.name || symbol;

        setLoading(true);

        try {
            const result = await createAlert({
                symbol,
                companyName,
                alertName,
                alertType,
                condition,
                threshold: Number(threshold),
                frequency
            });

            if (result.success) {
                toast.success("Alert created successfully");
                onOpenChange(false);
                setSymbol("");
                setAlertName("");
                setThreshold("");
            } else {
                toast.error(result.error || "Failed to create alert");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Price Alert
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Configure your price alert settings here.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    {/* Alert Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-400">
                            Alert Name
                        </Label>
                        <Input
                            id="name"
                            value={alertName}
                            onChange={(e) => setAlertName(e.target.value)}
                            placeholder="e.g. Apple at Discount"
                            className="bg-[#1E1E1E] border-white/10 text-white focus-visible:ring-[#FCA311]"
                        />
                    </div>

                    {/* Stock Identifier */}
                    <div className="grid gap-2">
                        <Label htmlFor="stock" className="text-gray-400">
                            Stock identifier
                        </Label>
                        <Select value={symbol} onValueChange={setSymbol}>
                            <SelectTrigger className="bg-[#1E1E1E] border-white/10 text-white focus:ring-[#FCA311]">
                                <SelectValue placeholder="Select a stock" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E1E1E] border-white/10 text-white">
                                {watchlist.length === 0 ? (
                                    <div className="p-2 text-sm text-gray-500">No stocks in watchlist</div>
                                ) : (
                                    watchlist.map((stock) => (
                                        <SelectItem key={stock.symbol} value={stock.symbol}>
                                            {stock.name} ({stock.symbol})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Alert Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="type" className="text-gray-400">
                            Alert type
                        </Label>
                        <Select value={alertType} onValueChange={setAlertType}>
                            <SelectTrigger className="bg-[#1E1E1E] border-white/10 text-white focus:ring-[#FCA311]">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E1E1E] border-white/10 text-white">
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="percent_change">% Change</SelectItem>
                                <SelectItem value="volume">Volume</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Condition */}
                    <div className="grid gap-2">
                        <Label htmlFor="condition" className="text-gray-400">
                            Condition
                        </Label>
                        <Select value={condition} onValueChange={setCondition}>
                            <SelectTrigger className="bg-[#1E1E1E] border-white/10 text-white focus:ring-[#FCA311]">
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E1E1E] border-white/10 text-white">
                                <SelectItem value="greater_than">Greater than (&gt;)</SelectItem>
                                <SelectItem value="less_than">Less than (&lt;)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Threshold Value */}
                    <div className="grid gap-2">
                        <Label htmlFor="threshold" className="text-gray-400">
                            Threshold value
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FCA311]">$</span>
                            <Input
                                id="threshold"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                placeholder="eg: 140"
                                className="bg-[#1E1E1E] border-white/10 text-white pl-7 focus-visible:ring-[#FCA311]"
                            />
                        </div>
                    </div>

                    {/* Frequency */}
                    <div className="grid gap-2">
                        <Label htmlFor="frequency" className="text-gray-400">
                            Frequency
                        </Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger className="bg-[#1E1E1E] border-white/10 text-white focus:ring-[#FCA311]">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E1E1E] border-white/10 text-white">
                                <SelectItem value="once">Once</SelectItem>
                                <SelectItem value="daily">Once per day</SelectItem>
                                <SelectItem value="always">Every time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[#FCA311] hover:bg-[#FCA311]/90 text-black font-bold h-12"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Alert
                </Button>
            </DialogContent>
        </Dialog>
    );
}
