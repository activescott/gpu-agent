import { BootstrapIcon } from "@/pkgs/client/components/BootstrapIcon"

export default function Home() {
  return (
    <main>
      <div>
        <h1>Smart Price Comparison Shopping for GPUs for Machine Learning</h1>
        <BootstrapIcon icon="shop" />
        <p>
          This site provides a listing of available GPUs and machine-learning
          accelerators that support model training and model inference. Each
          listing provides a set of statistics based on industry benchmarks
          related to the accelerator card's performance for machine learning
          compared to it's price. So you always can buy a price based on is cost
          to operate and based on its speed and power requirements.
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
