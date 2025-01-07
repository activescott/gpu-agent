import Link from "next/link"

export function Carousel({
  header,
  children,
  href,
}: {
  header: React.ReactNode
  children: React.ReactNode
  href?: string
}) {
  return (
    <div className="my-container m-2 mt-5">
      <div className="my-container-card-header">
        <h4>
          {href ? (
            <Link className="underline-on-hover text-accent" href={href}>
              {header} →
            </Link>
          ) : (
            `${header} →`
          )}
        </h4>
      </div>
      <div className="overflow-x-scroll">
        <div
          className="flex flex-row flex-nowrap overflow-y-hidden"
          style={{
            scrollbarWidth: "none",
            width: "max-content", // This will make it as wide as its content needs
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
