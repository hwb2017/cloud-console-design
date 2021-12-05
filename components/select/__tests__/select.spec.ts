import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import Select from "../src/index.vue"
import type { SelectComponentInstance, SelectProps, OptionType } from "../src/type"

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

// 提取出一个常用的、可配置的待测组件用例
const getSelectVm = (configs: Partial<SelectProps> = {}, options?: OptionType[]) => {
  [
    'isMultiple',
    'clearable',
    'filterable',
    'allowCreate',
    'remote',
    'collapseTags',
    'automaticDropdown',
  ].forEach((config) => {
    configs[config] = configs[config] || false
  })
  configs.multipleLimit = configs.multipleLimit || 0
  if (!options) {
    options = [
      {
        value: '选项1',
        label: '黄金糕',
        disabled: false,
      },
      {
        value: '选项2',
        label: '双皮奶',
        disabled: false,
      },
      {
        value: '选项3',
        label: '蚵仔煎',
        disabled: false,
      },
      {
        value: '选项4',
        label: '龙须面',
        disabled: false,
      },
      {
        value: '选项5',
        label: '北京烤鸭',
        disabled: false,
      },
    ]
  }
  return _mount(
    `
    <c-select
      ref="select"
      :options="options"
      v-model="value"
      :is-multipe="isMultiple"
      :multiple-limit="multipleLimit"
      :popper-class="popperClass"
      :clearable="clearable"  
      :filterable="filterable"
      :collapse-tags="collapseTags"
      :allow-create="allowCreate"   
      :remote="remote"
      :loading="loading"
      :automatic-dropdown="automaticDropdown"
      :default-first-option="defaultFirstOption"
    >
    </c-select>
    `,
    () => ({
      options,
      isMultiple: configs.isMultiple,
      multipleLimit: configs.multipleLimit,
      clearable: configs.clearable,
      filterable: configs.filterable,
      collapseTags: configs.collapseTags,
      allowCreate: configs.allowCreate,
      popperClass: configs.popperClass,
      automaticDropdown: configs.automaticDropdown,
      loading: false,
      remote: configs.remote,
      value: configs.isMultiple ? [] : '',
      defaultFirstOption: configs.defaultFirstOption,
    })
  )
}

// 获取 append 到 body 上的下拉列表选项
const getOptions = () => {
  return Array.from<HTMLElement>(
    document.querySelectorAll('.ccd-select-dropdown__item')
  )
}

describe('Select', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('create', async () => {
    const wrapper = _mount(`<c-select v-model="value"></c-select>`, () => ({
      value: '',
    }))
    expect(wrapper.classes()).toContain('ccd-select')
    expect(wrapper.find<HTMLInputElement>('.ccd-input__inner').element.placeholder).toBe('Please select')
    const select = wrapper.findComponent({ name: "CSelect"})
    await wrapper.trigger('click')
    expect((select.vm as SelectComponentInstance).visible).toBe(true)
  })

  test('render slot `empty`', async() => {
    const wrapper = _mount(
      `
      <c-select v-model="value">
        <template #empty>
          <div class="empty-slot">EmptySlot</div>
        </template>
      </c-select>
      `,
      () => ({
        value: '',
      })
    )
    await wrapper.findComponent({ name: "CSelect"}).trigger('click')
    expect(document.querySelector('.empty-slot')?.textContent).toBe('EmptySlot')
  })

  test('options rendered correctly', async () => {
    const wrapper = getSelectVm()
    const options = getOptions()
    expect(options.length).toBe(5)

    const vm = wrapper.vm as SelectComponentInstance
    // options的类型是类数组的nodelist, 使用 Array.prototype.every.call 来调用数组方法, 或者通过 Array.from 转换
    const result = options.every((option, index) => {
      const text = option.textContent
      return text === vm.options[index].label
    })
    expect(result).toBeTruthy()
  })  

  test('custom dropdown class', () => {
    getSelectVm({ popperClass: 'custom-dropdown' })
    const popper = document.querySelector('.ccd-select__popper')
    if (popper !== undefined && popper !== null) {
      expect(popper.classList).toContain('custom-dropdown')
    }
  })

  test('default value', async() => {
    const wrapper = _mount(
      `<c-select v-model="value" :options="options"></c-select>`,
      () => ({
        options: [
          {
            value: '选项1',
            label: '黄金糕',
          },
          {
            value: '选项2',
            label: '双皮奶',
          },
        ],
        value: '选项2',
      })
    )
    await nextTick()
    expect(wrapper.find<HTMLInputElement>('.ccd-input__inner').element.value).toBe('双皮奶')
  })

  test('sync set value and options', async() => {
    const wrapper = _mount(
      `<c-select v-model="value" :options="options"></c-select>`,
      () => ({
        options: [
          {
            value: '选项1',
            label: '黄金糕',
          },
          {
            value: '选项2',
            label: '双皮奶',
          },
        ],
        value: '选项2',
      })
    )
    const vm = wrapper.vm
    vm.options = [
      {
        value: '选项1',
        label: '黄金糕',
      },
    ]
    vm.value = '选项1'
    await nextTick()
    expect(wrapper.find<HTMLInputElement>('.ccd-input__inner').element.value).toBe('黄金糕')
  })  

  test('single select', async () => {
    const handleChange = jest.fn()
    const wrapper = _mount(
      `<c-select v-model="value" :options="options" @change="handleChange"></c-select>`,
      () => ({
        options: [
          {
            value: '选项1',
            label: '黄金糕',
          },
          {
            value: '选项2',
            label: '双皮奶',
          },
          {
            value: '选项3',
            label: '蚵仔煎',
          },
          {
            value: '选项4',
            label: '龙须面',
          },
          {
            value: '选项5',
            label: '北京烤鸭',
          },
        ],
        value: '',
      }),
      {
        methods: {
          handleChange,
        },
      }
    )
    await wrapper.findComponent({ name: "CSelect" }).trigger('click')
    const options = getOptions()
    const input = wrapper.find<HTMLInputElement>('.ccd-input__inner').element
    const vm = wrapper.vm
    expect(vm.value).toBe('')
    expect(input.value).toBe('')
    options[2].click()
    await nextTick()
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(vm.value).toBe('选项3')
    expect(input.value).toBe('蚵仔煎')
    options[4].click()
    await nextTick()
    expect(handleChange).toHaveBeenCalledTimes(2)
    expect(vm.value).toBe('选项5')
    expect(input.value).toBe('北京烤鸭')
  })

  test('disabled option', async() => {
    const wrapper = getSelectVm()
    const vm = wrapper.vm as SelectComponentInstance
    vm.options[1].disabled = true
    await wrapper.findComponent({ name: "CSelect" }).trigger('click')
    const options = getOptions()
    expect(options[1].className).toContain('is-disabled')
    options[1].click()
    await nextTick()
    expect((vm as any).value).toBe('')
  })

  test('disabled select', () => {
    const wrapper = _mount('<c-select disabled></c-select>')
    expect(wrapper.find('.ccd-input').classes()).toContain('is-disabled')
  })
  
  test('clearable', async() => {
    const wrapper = getSelectVm({ clearable: true })
    const select = wrapper.findComponent({ name: 'CSelect' })
    const vm = wrapper.vm as any
    const selectVm = select.vm as SelectComponentInstance
    vm.value = '选项1'
    await nextTick()
    selectVm.inputHovering = true
    await nextTick()
    const iconClear = wrapper.find('.ccd-input__clear')
    expect(iconClear.exists()).toBeTruthy()
    await iconClear.trigger('click')
    expect(vm.value).toBe('')
  })
  
  test('keyboard operations', async() => {
    const wrapper = getSelectVm()
    const select = wrapper.findComponent({ name: 'CSelect' })
    const vm = select.vm as SelectComponentInstance
    let i = 8
    while(i--) {
      vm.navigateOptions('next')
    }
    vm.navigateOptions('prev')
    vm.navigateOptions('prev')
    vm.navigateOptions('prev')
    await nextTick()
    expect(vm.hoveringIndex).toBe(4)
    vm.selectHoveringOption()
    await nextTick()
    expect((wrapper.vm as any).value).toBe('选项5')
    vm.toggleDropdown()
    await nextTick()
    vm.toggleDropdown()
    await nextTick()
    expect(vm.hoveringIndex).toBe(4)
  })

  test('check default first option', async() => {
    const wrapper = getSelectVm({
      defaultFirstOption: true
    })
    const select = wrapper.findComponent({ name: 'CSelect' })
    const selectVm = select.vm as SelectComponentInstance
    await select.trigger('click')

    expect(selectVm.hoveringIndex).toBe(0)
    selectVm.navigateOptions('next')
    expect(selectVm.hoveringIndex).toBe(1)
  })

  test('check default first option when the very first option is disabled', async () => {
    const demoOptions = [
      {
        value: 'HTML',
        label: 'HTML',
        disabled: true,
      },
      {
        value: 'CSS',
        label: 'CSS',
        disabled: false,
      },
      {
        value: 'JavaScript',
        label: 'JavaScript',
        disabled: false,
      },
    ]
    const wrapper = getSelectVm(
      {
        defaultFirstOption: true,
      },
      demoOptions
    )
    const select = wrapper.findComponent({ name: 'CSelect' })
    const selectVm = select.vm as SelectComponentInstance
    await select.trigger('click')

    expect(selectVm.hoveringIndex).toBe(1)
    selectVm.navigateOptions('next')
    expect(selectVm.hoveringIndex).toBe(2)
    selectVm.navigateOptions('next')
    expect(selectVm.hoveringIndex).toBe(1)
  })

  // test('show options only match the filter condition', async() => {
  //   const wrapper = getSelectVm({
  //     filterable: true
  //   })
  //   const select = wrapper.findComponent({ name: "CSelect"})
  //   await select.trigger('click')
    
  //   const options = getOptions()
  //   expect(options.length).toBe(5)

  //   const selectInput = wrapper.find('.ccd-input__inner')
  //   const selectInputEl = selectInput.element as HTMLInputElement
  //   selectInputEl.value = '黄'
  //   await selectInput.trigger('input')

  //   expect(options.length).toBe(1)
  // })
})