import { Feature } from "../../../pkgs/client/components/Feature"
import sitemapJson from "../../sitemap.json"

export default function Page() {
  return (
    <div>
      <h1>What You Need in a GPU for Machine Learning</h1>
      <p>
        Some research we&apos;ve put together on GPUs for machine learning is
        below.
      </p>
      <div className="row g-4 py-4 row-cols-1 row-cols-lg-3">
        <Feature title="Use cases for Machine Learning" icon="puzzle">
          {sitemapJson.data
            .filter((item) => item.path.startsWith("/ml/learn/use-case"))
            .map((item) => (
              <li key={item.path}>
                <a href={item.path}>{item.title}</a>
              </li>
            ))}
        </Feature>

        <Feature
          title="Machine Learning GPUs & Accelerators"
          icon="motherboard"
        >
          {sitemapJson.data
            .filter((item) => item.path.startsWith("/ml/learn/gpu"))
            .filter((item) => !item.path.startsWith("/ml/learn/gpu/ranking"))
            .map((item) => (
              <li key={item.path}>
                <a href={item.path}>{item.title}</a>
              </li>
            ))}
        </Feature>
        <Feature title="Machine Learning Models" icon="layers">
          {sitemapJson.data
            .filter((item) => item.path.startsWith("/ml/learn/models"))

            .map((item) => (
              <li key={item.path}>
                <a href={item.path}>{item.title}</a>
              </li>
            ))}
        </Feature>
      </div>
    </div>
  )
}
