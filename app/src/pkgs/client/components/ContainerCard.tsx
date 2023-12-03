export function ContainerCard({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="card text-center mx-2 mb-2">
      <div className="card-header">
        <h4>{header}</h4>
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}
