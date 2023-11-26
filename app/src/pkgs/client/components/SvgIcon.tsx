interface Props {
  icon: string
  svgViewBox?: string
  size?: "small" | "medium" | "large"
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
    <svg viewBox={props.svgViewBox} style={svgStyle}>
      <use href={`/images/${props.icon}.svg#root`}></use>
    </svg>
  )
}
