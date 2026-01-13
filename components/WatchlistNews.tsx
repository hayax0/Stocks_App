import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export interface NewsArticle {
    id: number | string;
    headline: string;
    summary: string;
    url: string;
    datetime: number;
    source: string;
    related?: string;
    image?: string;
    category?: string;
}

interface WatchlistNewsProps {
    news?: NewsArticle[];
}

const WatchlistNews = ({ news = [] }: WatchlistNewsProps) => {
    if (!news || news.length === 0) {
        return (
            <div className="flex flex-col gap-6 w-full mt-8">
                <h2 className="text-2xl font-bold text-white">News</h2>
                <div className="p-10 text-center text-gray-500 bg-[#1E1E1E]/30 rounded-xl border border-white/5">
                    No recent news available for your watchlist.
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full mt-8">
            <h2 className="text-2xl font-bold text-white">News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {news.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="bg-[#1E1E1E]/50 border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4 hover:bg-[#1E1E1E] transition-colors group"
                    >
                        <div className="flex flex-col gap-3">
                            <span className="w-fit bg-[#2A2A2A] text-[#4CC38A] text-xs font-bold px-2 py-1 rounded">
                                {item.related || item.category || 'MARKET'}
                            </span>
                            <h3 className="text-sm font-semibold text-white leading-tight group-hover:text-[#FCA311] transition-colors line-clamp-2">
                                {item.headline}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                                <span>{item.source}</span>
                                <span>•</span>
                                <span>{formatTimeAgo(item.datetime)}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                                {item.summary}
                            </p>
                        </div>

                        <Button
                            variant="link"
                            asChild
                            className="p-0 h-auto text-[#FCA311] text-xs justify-start hover:text-[#ffb74d] hover:underline hover:decoration-[#FCA311]"
                        >
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                Read More <ArrowRight className="ml-1 w-3 h-3" />
                            </a>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WatchlistNews;
