"use client";

import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleWatchlistSymbol } from "@/lib/actions/watchlist.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WatchlistButtonProps {
    symbol: string;
    companyName?: string;
    initialIsAdded?: boolean;
}

const WatchlistButton = ({ symbol, companyName, initialIsAdded = false }: WatchlistButtonProps) => {
    const [isAdded, setIsAdded] = useState(initialIsAdded);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const toggleWatchlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !isAdded;
        setIsAdded(newState); // Optimistic

        startTransition(async () => {
            try {
                const result = await toggleWatchlistSymbol(symbol, companyName || symbol);

                if (result.success) {
                    if (result.isAdded) {
                        toast.success("Added to watchlist");
                        router.push("/watchlist"); // Redirect as requested
                    } else {
                        toast.success("Removed from watchlist");
                        router.refresh();
                    }
                } else {
                    // Revert
                    setIsAdded(!newState);
                    toast.error(result.error || "Failed to update watchlist");
                }
            } catch (error) {
                setIsAdded(!newState);
                toast.error("An error occurred");
            }
        });
    };

    return (
        <Button
            onClick={toggleWatchlist}
            disabled={isPending}
            variant={isAdded ? "secondary" : "default"}
            className={`w-full font-bold transition-all duration-300 ${isAdded
                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400 border border-green-500/20"
                : "bg-yellow-500 hover:bg-yellow-600 text-black border border-yellow-500"
                }`}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : isAdded ? (
                <>
                    <Check className="mr-2 h-5 w-5" />
                    Added to Watchlist
                </>
            ) : (
                <>
                    <Plus className="mr-2 h-5 w-5" />
                    Add to Watchlist
                </>
            )}
        </Button>
    );
};

export default WatchlistButton;
