import Link from "next/link"
import Image from "next/image"
import NavItems from "./NavItems"
import UserDropdown from "./UserDropdown"
import { Button } from "@/components/ui/button";

const Header = ({ user }: { user: any }) => {
  return (
    <header className="sticky top-0 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">

        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist logo"
            width={140}
            height={32}
            className="w-auto h-8 cursor-pointer"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>

        <nav className="hidden sm:block">
          <NavItems />
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Button asChild className="yellow-btn">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>

      </div>
    </header>
  )
}

export default Header