import WatchlistTable from "@/components/WatchlistTable";
import WatchlistAlerts from "@/components/WatchlistAlerts";
import WatchlistNews from "@/components/WatchlistNews";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getWatchlistQuotes, getNews } from "@/lib/actions/finnhub.actions";
import { auth } from "@/lib/better-auth/auth";
import { getUserAlerts } from "@/lib/actions/alert.actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const WatchlistPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) {
        return redirect("/");
    }

    const symbols = await getWatchlistSymbolsByEmail(session.user.email);
    const watchlistData = await getWatchlistQuotes(symbols);
    const alerts = await getUserAlerts(session.user.email);
    const news = await getNews(symbols);

    return (
        <section className="flex flex-col w-full min-h-screen bg-black/95 p-6 md:p-8 overflow-x-hidden">
            {/* Page Title (Optional or part of layout, keeping minimal as per design focus on content) */}
            {/* <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Watchlist and Alerts</h1>
      </div> */}

            <div className="flex flex-col xl:flex-row gap-8 w-full">
                {/* Left Column: Watchlist Table */}
                <div className="w-full xl:w-2/3">
                    <WatchlistTable initialWatchlist={watchlistData} />
                </div>

                {/* Right Column: Alerts */}
                <div className="w-full xl:w-1/3">
                    <WatchlistAlerts watchlist={watchlistData} alerts={alerts} />
                </div>
            </div>

            {/* Bottom Section: News */}
            <WatchlistNews news={news} />
        </section>
    );
};

export default WatchlistPage;
