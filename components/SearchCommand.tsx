"use client"

import * as React from "react"
import { useRouter } from "next/navigation" // Import necessário para navegação
import { TrendingUp, Search, Loader2, Star } from "lucide-react" // Adicionei Star
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"
import { searchStocks, type StockWithWatchlistStatus } from "@/lib/actions/finnhub.actions"
import { cn } from "@/lib/utils"

interface SearchCommandProps {
    trigger?: "text" | "button"
    label?: string
}

export function SearchCommand({
    trigger = "button",
    label = "Search stocks...",
}: SearchCommandProps) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [results, setResults] = React.useState<StockWithWatchlistStatus[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    const router = useRouter()
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const [userWatchlist, setUserWatchlist] = React.useState<string[]>([])

    React.useEffect(() => {
        const fetchUserWatchlist = async () => {
            try {
                const { getParamsUserWatchlist } = await import("@/lib/actions/watchlist.actions")
                const symbols = await getParamsUserWatchlist()
                setUserWatchlist(symbols)
            } catch (error) {
                console.error("Failed to fetch user watchlist", error)
            }
        }

        if (open) {
            fetchUserWatchlist()
        }
    }, [open])

    React.useEffect(() => {
        const fetchStocks = async () => {
            setIsLoading(true)
            try {
                const data = await searchStocks(debouncedSearchTerm)
                const syncedData = data.map(stock => ({
                    ...stock,
                    isInWatchlist: userWatchlist.includes(stock.symbol)
                }))
                setResults(syncedData)
            } catch (error) {
                console.error("Failed to search stocks", error)
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }

        if (open) {
            fetchStocks()
        }
    }, [debouncedSearchTerm, open, userWatchlist])

    const handleSelectStock = (stock: StockWithWatchlistStatus) => {
        setOpen(false)
        setSearchTerm("")
        router.push(`/stocks/${stock.symbol}`)
    }

    const toggleWatchlist = async (e: React.MouseEvent, stock: StockWithWatchlistStatus) => {
        e.stopPropagation()
        e.preventDefault()

        if (stock.type === 'Crypto') return

        const isAdding = !stock.isInWatchlist

        const updatedWatchlist = isAdding
            ? [...userWatchlist, stock.symbol]
            : userWatchlist.filter(s => s !== stock.symbol)

        setUserWatchlist(updatedWatchlist)

        setResults((prev) =>
            prev.map((item) =>
                item.symbol === stock.symbol
                    ? { ...item, isInWatchlist: isAdding }
                    : item
            )
        )

        try {
            const { toggleWatchlistSymbol } = await import("@/lib/actions/watchlist.actions")
            const result = await toggleWatchlistSymbol(stock.symbol, stock.name)

            if (result.success) {
                if (result.isAdded) {
                    router.push("/watchlist")
                    router.refresh()
                } else {
                    router.refresh()
                }
            } else {
                console.error(result.error)
                setUserWatchlist(isAdding
                    ? userWatchlist.filter(s => s !== stock.symbol)
                    : [...userWatchlist, stock.symbol]
                )
                setResults((prev) =>
                    prev.map((item) =>
                        item.symbol === stock.symbol
                            ? { ...item, isInWatchlist: !isAdding }
                            : item
                    )
                )
            }
        } catch (error) {
            console.error("Failed to toggle watchlist", error)
            // Revert
            setUserWatchlist(isAdding
                ? userWatchlist.filter(s => s !== stock.symbol)
                : [...userWatchlist, stock.symbol]
            )
            setResults((prev) =>
                prev.map((item) =>
                    item.symbol === stock.symbol
                        ? { ...item, isInWatchlist: !isAdding }
                        : item
                )
            )
        }
    }

    return (
        <>
            {trigger === "text" ? (
                <span
                    onClick={() => setOpen(true)}
                    className="cursor-pointer text-gray-400 hover:text-yellow-500 transition-colors flex items-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">{label}</span>
                </span>
            ) : (
                <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    className="w-full justify-start text-muted-foreground bg-gray-800 border-gray-600 hover:bg-gray-700 hover:text-gray-100 relative"
                >
                    <Search className="mr-2 h-4 w-4" />
                    {label}
                    <kbd className="pointer-events-none absolute right-2 top-[50%] -translate-y-[50%] hidden h-5 select-none items-center gap-1 rounded border border-gray-600 bg-gray-900 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-gray-400">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            )}

            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                className="top-[5%] translate-y-0 max-w-3xl bg-gray-800 border-gray-600 text-gray-100 shadow-2xl"
            >
                <div className="flex items-center border-b border-gray-600 px-3 w-full">
                    <CommandInput
                        placeholder="Search stocks..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="flex-1 w-full min-w-0 h-11 rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 text-gray-100 disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0"
                    />

                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-yellow-500 ml-2 shrink-0" />
                    )}
                </div>

                <CommandList className="bg-gray-800 scrollbar-hide-default max-h-[400px]">
                    {!isLoading && results.length === 0 && (
                        <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                            No results found.
                        </CommandEmpty>
                    )}

                    {results.length > 0 && (
                        <CommandGroup
                            heading={searchTerm ? "Search Results" : "Popular Stocks and Crypto"}
                            className="text-gray-500 px-2"
                        >
                            {results.map((stock, index) => (
                                <CommandItem
                                    key={`${stock.symbol}-${index}`}
                                    value={`${stock.symbol} ${stock.name}`}
                                    onSelect={() => handleSelectStock(stock)}
                                    className="group flex items-center gap-3 cursor-pointer rounded-md px-2 py-3 aria-selected:bg-gray-700 data-[selected=true]:bg-gray-700 transition-colors my-1 pr-2"
                                >

                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/50 shrink-0">
                                        {searchTerm ? (
                                            <Search className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <TrendingUp className="h-4 w-4 text-yellow-500" />
                                        )}
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-bold text-gray-100 truncate">{stock.symbol}</span>
                                        <span className="text-xs text-gray-400 uppercase truncate">
                                            {stock.name} | {stock.exchange}
                                        </span>
                                    </div>

                                    {stock.type !== 'Crypto' && (
                                        <div
                                            role="button"
                                            onClick={(e) => toggleWatchlist(e, stock)}
                                            className={cn(
                                                "ml-2 p-2 rounded-full hover:bg-gray-600 transition-colors z-20",
                                                stock.isInWatchlist ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"
                                            )}
                                        >
                                            <Star
                                                className={cn(
                                                    "h-4 w-4",
                                                    stock.isInWatchlist && "fill-yellow-500"
                                                )}
                                            />
                                        </div>
                                    )}

                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}