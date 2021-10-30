import type { Option, OptionType } from "./type"



// flattenOptions 把分组聚合的options也给拍平
export const flattenOptions = (options: Array<OptionType>) => {
  const flattened = [] as OptionType[]
  options.map((option) => {
    if (Array.isArray(option.options)) {
      flattened.push({
        label: option.label,
        isTitle: true,
        type: "Group",
      })
      option.options.forEach((o: Option) => {
        flattened.push(o)
      })
      flattened.push({
        label: option.label,
        type: "Group",
      })
    } else {
      flattened.push(option)
    }
  })
  return flattened
}