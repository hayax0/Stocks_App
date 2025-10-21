'use client'

import { useState, useEffect } from 'react'
import { NAV_ITEMS } from '@/lib/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavItems = () => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, label }) => (
        <li key={href}>
          <Link 
            href={href} 
            className={`hover:text-yellow-500 transition-colors ${
              mounted && isActive(href) ? 'text-gray-100' : ''
            }`}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default NavItems