import sitemapJson from "../../../app/sitemap.json"

const entries = [...sitemapJson.data]

export const SiteFooter = () => {
  const start_year = 2023
  return (
    <footer className="pt-5 mx-2 my-5 text-muted border-top fw-lighter">
      <div className="d-flex  w-100 flex-wrap">
        <ul className="nav flex-column mx-4">
          <li className="nav-item">Shop GPUs</li>
          {entries
            .filter((item) => item.path.startsWith("/ml/shop"))
            .map((item) => (
              <li className="nav-item" key={item.path}>
                <a className="nav-link" href={item.path}>
                  {item.title}
                </a>
              </li>
            ))}
        </ul>

        <ul className="nav flex-column">
          <li className="nav-item">Best Performing GPUs for the Money</li>
          {entries
            .filter((item) => item.path.startsWith("/ml/learn/gpu/ranking"))
            .map((item) => (
              <li className="nav-item" key={item.path}>
                <a className="nav-link" href={item.path}>
                  {item.title}
                </a>
              </li>
            ))}
        </ul>

        <ul className="nav flex-column">
          <li className="nav-item">Machine Learning GPUs & Accelerators</li>
          {entries
            .filter(
              (item) =>
                item.path.startsWith("/ml/learn/gpu") &&
                !item.path.startsWith("/ml/learn/gpu/ranking"),
            )
            .map((item) => (
              <li className="nav-item" key={item.path}>
                <a className="nav-link" href={item.path}>
                  {item.title}
                </a>
              </li>
            ))}
        </ul>

        <ul className="nav flex-column mx-4">
          <li className="nav-item">Machine Learning Use Cases</li>
          {entries
            .filter((item) => item.path.startsWith("/ml/learn/use-case"))
            .map((item) => (
              <li className="nav-item" key={item.path}>
                <a className="nav-link" href={item.path}>
                  {item.title}
                </a>
              </li>
            ))}
        </ul>

        <ul className="nav flex-column mx-4">
          <li className="nav-item">Machine Learning Models</li>
          {entries
            .filter((item) => item.path.startsWith("/ml/learn/models"))
            .map((item) => (
              <li className="nav-item" key={item.path}>
                <a className="nav-link" href={item.path}>
                  {item.title}
                </a>
              </li>
            ))}
        </ul>
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
