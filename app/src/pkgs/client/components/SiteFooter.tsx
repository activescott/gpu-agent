import sitemapJson from "../../../app/sitemap.json"

const entries = Array.from(sitemapJson.data)

export const SiteFooter = () => {
  const start_year = 2023
  return (
    <footer className="pt-5 mx-2 my-5 text-muted border-top fw-lighter">
      <div className="d-flex">
        <ul className="nav flex-column mx-4">
          <li className="nav-item">Machine Learning Use Cases</li>
          {entries
            .filter((item) => item.path.startsWith("/ml/use-case"))
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
            .filter((item) => item.path.startsWith("/ml/gpu"))
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
            .filter((item) => item.path.startsWith("/ml/models"))
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
        <ul className="nav justify-content-evenly">
          <li className="navbar-text">
            Ping Poet Products &middot; &copy;{" "}
            {start_year && new Date().getFullYear() != start_year
              ? `${start_year} - ${new Date().getFullYear()}`
              : new Date().getFullYear().toString()}
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
