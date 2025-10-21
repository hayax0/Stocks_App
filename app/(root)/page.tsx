import CryptoOverview from "@/components/CryptoOverview";
import StockHeatmap from "@/components/StockHeatmap";

const Home = () => {
  return (
    <div className="min-h-screen home-wrapper bg-black">
      
      {/* Seção Crypto */}
      <section className="border-b border-black-800 py-6">
        <div className="px-6">
          <h1 className="text-2xl font-bold text-white mb-4">Crypto Markets</h1>
          <div className="h-[550px]">
            <CryptoOverview />
          </div>
        </div>
      </section>

      {/* Seção Stock Heatmap */}
      <section className="py-6">
        <div className="px-6">
          <h2 className="text-2xl font-bold text-white mb-4">Stock Heatmap</h2>
          <div className="h-[600px]">
            <StockHeatmap />
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home