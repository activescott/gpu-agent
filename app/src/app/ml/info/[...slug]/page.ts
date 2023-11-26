import { permanentRedirect } from "next/navigation"

export default async function Info({ params }: { params: { slug: string[] } }) {
  // for was using /ml/info/* but changed it to learn. This allows the search engines who read that old sitemap (but hadn't yet indexed these pages) to still get valid results
  permanentRedirect("/ml/learn/" + params.slug.join("/"))
}
