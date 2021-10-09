import { Comment, h } from "vue"

export default function renderArrow(showArrow: boolean) {
  return showArrow
    ? h(
        "div",
        {
          ref: "arrowRef",
          class: "ccd-popover__arrow",
        }
      )
    : h(Comment, null, '')
}