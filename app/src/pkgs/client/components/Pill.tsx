import { ReactNode } from "react"

export const Pill = ({ children }: { children: ReactNode }) => {
  return (
    <span className="badge rounded-pill text-bg-secondary mx-1">
      {children}
    </span>
  )
}
