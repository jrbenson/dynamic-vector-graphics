import Component from '../components/component'
import TextComponent from '../components/text'
import TransformComponent from '../components/transform'
import StyleComponent from '../components/style'

export function getComponents(svg: Element): Array<Component> {
  let components: Array<Component> = []
  components.push(...TextComponent.getComponents(svg))
  components.push(...TransformComponent.getComponents(svg))
  components.push(...StyleComponent.getComponents(svg))
  return components
}
