import Link from "next/link"
import CookieBanner from "./CookieBanner"

export const SiteFooter = () => {
  const start_year = 2023
  return (
    <footer className="pt-5 mx-2 my-5 text-muted border-top fw-lighter">
      <CookieBanner />
      <div className="w-100 d-flex justify-content-around flex-wrap">
        <FooterLink href="/ml/shop/gpu" label="Browse GPUs for Sale" />
        <FooterLink href="/ml/learn/gpu/ranking" label="GPU Rankings" />
        <FooterLink
          href="/ml/learn"
          label="Learn about GPUs for Machine Learning"
        />
      </div>
      <div>
        <div className="muted fst-italic">
          The site is 100% free to use and does not require any registration.
          You do not pay us any money. When you click a link to a product and
          purchase an item, it may generate a small referral fee for us at no
          cost to you. Thank you for your support! 🙏
        </div>
        <ul className="nav justify-content-evenly">
          <li className="navbar-text">
            Ping Poet Products &middot; &copy;{" "}
            {start_year && new Date().getFullYear() != start_year
              ? `${start_year} - ${new Date().getFullYear()}`
              : new Date().getFullYear().toString()}
          </li>
          <li className="nav-item">
            <a className="nav-link text-muted" href={"/about"}>
              About
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-muted" href={"/contact"}>
              Contact Us
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-muted" href={"/policy/terms"}>
              Terms of Service
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-muted" href={"/policy/privacy"}>
              Privacy &amp; Cookies
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} className="mx-2">
    {label}
  </Link>
)
