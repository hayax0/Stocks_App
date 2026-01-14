import Link from "next/link"
import Image from "next/image"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-4">
      <div className="w-full max-w-[450px] space-y-6">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Image
              src="/assets/icons/logo.svg"
              alt="Signalist logo"
              width={160}
              height={40}
              className='h-10 w-auto'
            />
          </Link>
        </div>

        <div>{children}</div>

        <div className="pt-12 text-center border-t border-gray-900 mt-8">
          <p className="text-sm text-gray-500 italic">
            "The alerts are spot-on. I feel more confident making moves."
          </p>
          <p className="text-xs text-gray-600 mt-2 font-semibold">
            — Matheus Fer., Retail Investor
          </p>
        </div>

      </div>
    </main>
  )
}

export default Layout