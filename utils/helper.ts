export const noop = () => void 0

export const throwScopedError = (scope: string, message: string) => {
  throw new Error(`[${scope}] ${message}`)
}

export const checkNoUndefined = <T>(param: T | undefined): param is T => {
  return param === undefined ? false : true
}