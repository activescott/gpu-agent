import { CSSProperties } from "react"

interface Props {
  icon: string
  svgViewBox?: string
  size?: "xs" | "small"
  className?: string
}

export const SvgIcon = (props: Props): JSX.Element => {
  props = {
    svgViewBox: "0 0 24 24",
    size: "small",
    ...props,
  }
  const svgStyle: CSSProperties = { fill: "currentColor" }

  if (props.size === "small") {
    svgStyle.width = "24px"
    svgStyle.height = "24px"
  } else if (props.size === "xs") {
    svgStyle.width = "16px"
    svgStyle.height = "16px"
  }

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
