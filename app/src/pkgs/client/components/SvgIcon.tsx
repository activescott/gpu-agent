interface Props {
  icon: string
  svgViewBox?: string
  size?: "small" | "medium" | "large"
  className?: string
}

export const SvgIcon = (props: Props): JSX.Element => {
  props = {
    svgViewBox: "0 0 24 24",
    size: "small",
    ...props,
  }
  const svgStyle =
    props.size === "small" ? { width: "24px", height: "24px" } : {}

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
