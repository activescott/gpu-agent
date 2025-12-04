import { Metadata } from "next"
import { Feature } from "@/pkgs/client/components/Feature"
import sitemapJson from "../../../sitemap.static-pages.json"

export const metadata: Metadata = {
  title: "What to Look for in a GPU for Machine Learning",
  description:
    "Learn about GPUs for machine learning including use cases, models, and frequently asked questions.",
  alternates: { canonical: "https://gpupoet.com/gpu/learn/ai" },
}

export default function Page() {
  return (
    <div>
      <h1>{metadata.title as string}</h1>
      <p>
        Some research we&apos;ve put together on GPUs for machine learning is
        below.
      </p>
      <div className="row g-4 py-4 row-cols-1 row-cols-lg-2">
        <Feature
          title="Machine Learning GPU Frequently Asked Questions"
          icon="person-raised-hand"
        >
          {sitemapJson.data
            .filter((item) => item.path.startsWith("/ml/learn/faq"))
            .map((item) => (
              <li key={item.path}>
                <a href={item.path}>{item.title}</a>
              </li>
            ))}
        </Feature>

        <Feature title="Use Cases for Machine Learning" icon="puzzle">
          {sitemapJson.data
            .filter((item) => item.path.startsWith("/ml/learn/use-case"))
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

        <Feature title="GPU Specifications" icon="motherboard">
          {sitemapJson.data
            .filter((item) => item.path.startsWith("/ml/learn/gpu"))
            .filter((item) => !item.path.startsWith("/ml/learn/gpu/ranking"))
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
