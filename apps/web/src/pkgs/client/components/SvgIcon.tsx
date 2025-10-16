import { CSSProperties, type JSX } from "react"

interface Props {
  icon: string
  svgViewBox?: string
  size?: "xs" | "small" | "medium"
  className?: string
}

export const SvgIcon = (props: Props): JSX.Element => {
  props = {
    svgViewBox: "0 0 24 24",
    size: "small",
    ...props,
  }
  const svgStyle: CSSProperties = { fill: "currentColor" }

  const sizes = {
    small: "24px",
    xs: "16px",
    medium: "48px",
  }

  svgStyle.width = sizes[props.size!]
  svgStyle.height = sizes[props.size!]

  return (
    <svg
      className={props.className}
      viewBox={props.svgViewBox}
      style={svgStyle}
    >
      <use href={`/images/${props.icon}.svg#root`}></use>
    </svg>
  )
}
