import Component from '../components/component'
import DuplicateComponent from '../components/duplicate'
import TextComponent from '../components/text'
import TransformComponent from '../components/transform'
import StyleComponent from '../components/style'

let components: Array<Component> = []

/**
 * Retrieves array of map arrays of components for each SVGElement of a given SVG
 * @param svg 
 * @returns 
 */
export function getComponents(svg: Element) {
  let components: Array<Component> = []
  components.push(...DuplicateComponent.getComponent(svg))
  components.push(...TextComponent.getComponent(svg))
  components.push(...TransformComponent.getComponent(svg))
  components.push(...StyleComponent.getComponent(svg))
  // getDuplicateComponent(svg)
  // getTextComponent(svg)
  // getTransformComponent(svg)
  // getStyleComponent(svg)
  
  return components
}

// function getDuplicateComponent(svg: Element) {
//   components.push(...DuplicateComponent.getComponent(svg))
// }

// function getTextComponent(svg: Element) {
//   components.push(...TextComponent.getComponent(svg))
// }

// function getTransformComponent(svg: Element) {
//   components.push(...TransformComponent.getComponent(svg))
// }

// function getStyleComponent(svg: Element) {
//   components.push(...StyleComponent.getComponent(svg))
// }