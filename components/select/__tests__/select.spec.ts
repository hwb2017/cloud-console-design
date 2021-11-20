import { mount } from "@vue/test-utils"
import Select from "../src/index.vue"
import { SelectComponentInstance } from "../src/type"

// 预置待测组件 Select
const _mount = (template: string, data: any = () => ({}), otherObj?: any) =>
  mount(
    {
      components: {
        'c-select': Select
      },
      template,
      data,
      ...otherObj,
    },
    {
      attachTo: 'body'
    }
  )

describe('Select', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('create', () => {
    const wrapper = _mount(`<c-select v-model="value"></c-select>`, () => ({
      value: '',
    }))
    expect(wrapper.classes()).toContain('ccd-select')
    expect(wrapper.find<HTMLInputElement>('.ccd-input__inner').element.placeholder).toBe('Please select')
    const select = wrapper.findComponent({ name: "CSelect"})
    wrapper.trigger('click')
    expect((select.vm as SelectComponentInstance).visible).toBe(true)
  })
})