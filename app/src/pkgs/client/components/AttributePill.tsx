import { ReactNode } from "react"

export const AttributePill = ({ children }: { children: ReactNode }) => {
  return (
    <span className="badge rounded-pill text-bg-inverse mx-1">{children}</span>
  )
}
