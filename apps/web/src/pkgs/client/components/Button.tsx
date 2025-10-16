import type { JSX } from "react"
type ButtonProps = {
  onClick?: () => void
  variant?:
    | "primary"
    | "outline-primary"
    | "secondary"
    | "outline-secondary"
    | "success"
    | "outline-success"
    | "danger"
    | "outline-danger"
    | "warning"
    | "outline-warning"
    | "info"
    | "outline-info"
    | "light"
    | "outline-light"
    | "dark"
    | "outline-dark"
    | "link"
    | "outline-link"
  sizeVariant?: "sm" | "lg"
  disabled?: boolean
  children?: React.ReactNode
  href?: string
  submit?: boolean
  className?: string
}

export const Button = ({
  onClick,
  children,
  variant = "outline-primary",
  sizeVariant,
  disabled,
  href,
  submit,
  className = "",
}: ButtonProps): JSX.Element => {
  const classes = ["btn"]

  if (variant) {
    classes.push(`btn-${variant}`)
  }
  if (sizeVariant) {
    classes.push(`btn-${sizeVariant}`)
  }

  for (const c of className.split(" ")) classes.push(c)

  return href ? (
    <a
      href={href}
      className={classes.join(" ")}
      role="button"
      aria-disabled={disabled}
    >
      {children}
    </a>
  ) : (
    <button
      className={classes.join(" ")}
      type={submit ? "submit" : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}
