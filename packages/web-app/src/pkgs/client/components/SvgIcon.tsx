import { CSSProperties, type JSX } from "react"

type CSSWidth = CSSProperties["width"]
type CSSHeight = CSSProperties["height"]

interface Props {
  icon: string
  svgViewBox?: string
  /**
   * The size of the icon. Mutually exclusive with width and height. If width or
   * height is provided, it will override the size prop.
   */
  size?: "xs" | "small" | "medium"

  /**
   * The width and height of the icon. Mutually exclusive with size. If width or
   * height is provided, it will override the size prop.
   */
  width?: CSSWidth
  /**
   * The width and height of the icon. Mutually exclusive with size. If width or
   * height is provided, it will override the size prop.
   */
  height?: CSSHeight
  className?: string
  alt?: string
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

  if (props.width || props.height) {
    svgStyle.width = props.width
    svgStyle.height = props.height
  } else {
    svgStyle.width = sizes[props.size!]
    svgStyle.height = sizes[props.size!]
  }

  return (
    <svg
      className={props.className}
      viewBox={props.svgViewBox}
      style={svgStyle}
      role="img"
      aria-label={props.alt}
    >
      <use href={`/images/${props.icon}.svg#root`}></use>
    </svg>
  )
}
