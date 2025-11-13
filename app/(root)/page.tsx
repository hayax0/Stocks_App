import CryptoOverview from "@/components/CryptoOverview";
import StockHeatmap from "@/components/StockHeatmap";
import TopStories from "@/components/TopStories";
import MarketData from "@/components/MarketData";

const Home = () => {
  return (
    <div className="min-h-screen home-wrapper bg-black p-6">
      
      {/* Topo - Market Overview (menor) e Stock Heatmap (maior) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        
        {/* Market Overview - MENOR (1 coluna) */}
        <div className="bg-[#0f0f0f] rounded-lg p-4 xl:col-span-1">
          <h1 className="text-xl font-bold text-white mb-3">Market Overview</h1>
          <div className="h-[500px]">
            <CryptoOverview />
          </div>
        </div>

        {/* Stock Heatmap - MAIOR (2 colunas) */}
        <div className="bg-[#0f0f0f] rounded-lg p-4 xl:col-span-2">
          <h2 className="text-xl font-bold text-white mb-3">Stock Heatmap</h2>
          <div className="h-[500px]">
            <StockHeatmap />
          </div>
        </div>

      </div>

      {/* Embaixo - Top Stories (menor) e Market Data (maior) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Top Stories - MENOR (1 coluna) */}
        <div className="bg-[#0f0f0f] rounded-lg p-4 xl:col-span-1">
          <div className="h-[500px]">
            <TopStories />
          </div>
        </div>

        {/* Market Data - MAIOR (2 colunas) */}
        <div className="bg-[#0f0f0f] rounded-lg p-4 xl:col-span-2">
          <div className="h-[500px]">
            <MarketData />
          </div>
        </div>

      </div>

    </div>
  )
}

export default Home