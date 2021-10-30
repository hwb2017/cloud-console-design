import { Fragment, Comment } from "vue"
import type { VNodeChild, VNode } from "vue"

export const noop = () => void 0

export const throwScopedError = (scope: string, message: string) => {
  throw new Error(`[${scope}] ${message}`)
}

export const checkNoUndefined = <T>(param: T | undefined): param is T => {
  return param === undefined ? false : true
}

export const checkNoNullable = <T>(param: T | null): param is T => {
  return param === null ? false : true
}

export const generateId = ():number => Math.floor(Math.random()* 10000)

export const isServer = () => {
  return typeof window === 'undefined'
}

export const isBool = (val: unknown) => typeof val === 'boolean'

const toRawType = (val) => {
  return Object.prototype.toString.call(val).slice(8, -1)
}

export const isHTMLElement = (val: unknown) => toRawType(val).startsWith('HTML')

export const isComment = (node: VNodeChild) => (node as VNode).type === Comment

export const isTemplate = (node: VNodeChild) => (node as VNode).type === 'template'

export const isFragment = (node: VNodeChild) => (node as VNode).type === Fragment

export const isObject = (val: unknown): val is Record<string | number | symbol, unknown> => val !== null && typeof val === 'object'

/**
 * get a valid child node (not fragment nor comment)
 * @param node {VNode} node to be searched
 * @param depth {number} depth to be searched
 */
function getChildren(node: VNode, depth: number): undefined | VNode {
  if (isComment(node)) return
  if (isFragment(node) || isTemplate(node)) {
    return depth > 0
      ? getFirstValidNode(node.children as VNodeChild, depth - 1)
      : undefined
  }
  return node
}

export const getFirstValidNode = (
  nodes: VNodeChild,
  maxDepth = 3
): ReturnType<typeof getChildren> => {
  if (Array.isArray(nodes)) {
    return getChildren(nodes[0] as VNode, maxDepth)
  } else {
    return getChildren(nodes as VNode, maxDepth)
  }
}

export const getValueByPath = <T = unknown>(obj: Record<string, unknown>, paths = ''): T | undefined => {
  let ret: Record<string, unknown> | T = obj
  paths.split('.').forEach((path) => {
    ret = ret?.[path]
  })
  return ret as T | undefined
}