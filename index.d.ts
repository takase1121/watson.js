declare module 'watson.js' {
  interface ParseOptions {
    mode: string
    unsafe: boolean
  }

  interface StringifyOptions {
    mode: string,
    prettify: boolean
  }

  export function parse(str: string, options: ParseOptions): any
  export function stringify(x: any, options: StringifyOptions): string
}