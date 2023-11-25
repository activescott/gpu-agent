import sitemapJson from "./sitemap.json"
const entries = [...sitemapJson.data]

export default function Home() {
  return (
    <main>
      <div>
        <h1>
          Compare Price & Benchmarked Performance of GPUs & AI Accelerators{" "}
        </h1>
        <div>
          <p>
            Compare prices to training or inference performance for the
            following GPUs:
          </p>
          <ul className="nav flex-column mx-4">
            {entries
              .filter((item) => item.path.startsWith("/shop"))
              .map((item) => (
                <li className="nav-item" key={item.path}>
                  <a className="nav-link" href={item.path}>
                    {item.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>

        <p>
          Welcome to the ultimate resource for software engineers, data
          scientists, and SREs in the world of machine learning: a one-stop
          platform where performance meets value. We understand the criticality
          of precise hardware performance in AI model training and inference.
          That&apos;s why we&apos;ve gathered the most rigorous MLPerf
          benchmarks for all leading GPUs and AI accelerators, offering you a
          unique window into their capabilities. Our platform is more than just
          a comparison tool; it&apos;s an insightful guide to making informed
          decisions. With us, you&apos;ll find not just raw performance
          statistics, but a comprehensive breakdown of price by crucial
          performance metrics, ensuring you get the most out of every dollar
          spent. No more back-orders or unavailable items; every product listed
          is ready for immediate purchase. And the best part? This invaluable
          tool is entirely free, thanks to our affiliate partnerships. So, dive
          into our site, be surprised by the revealing performance metrics of
          every GPU and AI Accelerator on the market, and if you&apos;re
          compelled, make an informed purchase right now!
        </p>
        <p>
          The site is 100% free to use and does not require any registration.
          You do not pay us any money. When you click a link to a product and
          purchase an item, it may generate a small referral fee for us at no
          cost to you. Thank you for your support! 🙏
        </p>
      </div>
    </main>
  )
}
