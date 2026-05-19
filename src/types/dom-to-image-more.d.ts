declare module 'dom-to-image-more' {
  interface Options {
    quality?: number
    scale?: number
    width?: number
    height?: number
    bgcolor?: string
    style?: Partial<CSSStyleDeclaration>
    filter?: (node: Node) => boolean
  }
  export function toPng(node: Node, options?: Options): Promise<string>
  export function toJpeg(node: Node, options?: Options): Promise<string>
  export function toSvg(node: Node, options?: Options): Promise<string>
  export function toBlob(node: Node, options?: Options): Promise<Blob>
  export function toPixelData(node: Node, options?: Options): Promise<Uint8ClampedArray>
}
