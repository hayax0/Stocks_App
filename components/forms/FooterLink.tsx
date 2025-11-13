import Link from "next/link"

interface FooterLinkProps {
  text: string;
  linkText: string;
  href: string;
}

const FooterLink = ({ text, linkText, href }: FooterLinkProps) => {
  return (
    <div className="text-center pt-4">
      <p className="text-sm text-gray-400">
        {text}{' '}
        <Link href={href} className="text-blue-500 hover:text-blue-400 underline font-medium">
          {linkText}
        </Link>
      </p>
    </div>
  )
}

export default FooterLink