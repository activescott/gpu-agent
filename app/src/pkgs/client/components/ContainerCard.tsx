export function ContainerCard({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="card text-center">
      <div className="card-header">{header}</div>
      <div className="card-body">{children}</div>
    </div>
  )
}
