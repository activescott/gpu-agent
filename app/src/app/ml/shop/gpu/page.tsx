import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { fetchListingsForAllGPUsWithCache } from "@/pkgs/server/listings"
import { chain } from "irritable-iterable"
import { Metadata } from "next"

// revalidate the data at most every hour:
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Price Compare GPUs for Machine Learning based on specs",
  description: "Dollar/performance price comparisons for Machine Learning GPUs",
  alternates: { canonical: "https://coinpoet.com/ml/shop/gpu" },
}

export default async function Page() {
  const rawListings = await fetchListingsForAllGPUsWithCache()
  const listings = chain(rawListings).collect()

  return (
    <main>
      <h1>Find & Buy GPUs by Dollar/performance</h1>
      <ListingGallery
        listings={listings.map((item) => ({
          item,
          specs: item.gpu,
        }))}
        initialSortKey="fp32TFLOPS"
      />
    </main>
  )
}
