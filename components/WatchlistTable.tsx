"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { WatchlistData } from "@/lib/actions/finnhub.actions";
import { toggleWatchlistSymbol } from "@/lib/actions/watchlist.actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WatchlistTableProps {
    initialWatchlist: WatchlistData[];
}

const WatchlistTable = ({ initialWatchlist }: WatchlistTableProps) => {
    const [watchlist, setWatchlist] = useState<WatchlistData[]>(initialWatchlist);
    const router = useRouter();

    const handleRemove = async (symbol: string, companyName: string) => {
        const previousWatchlist = [...watchlist];
        setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));

        try {
            const result = await toggleWatchlistSymbol(symbol, companyName);
            if (!result.success) {
                setWatchlist(previousWatchlist);
                toast.error("Failed to remove from watchlist");
            } else {
                toast.success(`${symbol} removed from watchlist`);
                router.refresh();
            }
        } catch (error) {
            setWatchlist(previousWatchlist);
            toast.error("An error occurred");
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Watchlist</h2>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#1E1E1E]/50 overflow-hidden flex-1 min-h-[400px]">
                <Table>
                    <TableHeader className="bg-[#1E1E1E] ">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="text-gray-400">Company</TableHead>
                            <TableHead className="text-gray-400">Symbol</TableHead>
                            <TableHead className="text-gray-400">Price</TableHead>
                            <TableHead className="text-gray-400">Change</TableHead>
                            <TableHead className="text-gray-400">Market Cap</TableHead>
                            <TableHead className="text-gray-400">P/E Ratio</TableHead>
                            <TableHead className="text-gray-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {watchlist.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                    Your watchlist is empty. Add stocks via search!
                                </TableCell>
                            </TableRow>
                        ) : (
                            watchlist.map((row) => (
                                <TableRow
                                    key={row.symbol}
                                    className="border-white/10 hover:bg-white/5 data-[state=selected]:bg-white/5 transition-colors"
                                >
                                    <TableCell>
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="bg-[#FCA311]/20 p-1.5 rounded-full cursor-pointer hover:bg-[#FCA311]/40 transition-colors"
                                                onClick={() => handleRemove(row.symbol, row.name || "")}
                                                title="Remove from favorites"
                                            >
                                                <Star className="w-3 h-3 text-[#FCA311] fill-[#FCA311]" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">
                                        {row.name}
                                    </TableCell>
                                    <TableCell className="text-gray-300">{row.symbol}</TableCell>
                                    <TableCell className="text-white">${row.price?.toFixed(2)}</TableCell>
                                    <TableCell
                                        className={`${(row.change || 0) >= 0
                                            ? "text-[#4CC38A]"
                                            : "text-[#E63946]"
                                            }`}
                                    >
                                        {row.change > 0 ? "+" : ""}{row.change?.toFixed(2)} ({row.changePercent?.toFixed(2)}%)
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        {row.marketCap ? `$${(row.marketCap / 1000).toFixed(2)}B` : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-gray-300">-</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleRemove(row.symbol, row.name || "")}
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 h-8 text-xs px-3 gap-2"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default WatchlistTable;
