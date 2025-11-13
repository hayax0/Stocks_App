import Header from "@/components/Header";
import { Providers } from "./providers";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <main className="min-h-screen text-gray-400">
        <Header />
        <div className="container py-10">
          {children}
        </div>
      </main>
    </Providers>
  )
}

export default Layout