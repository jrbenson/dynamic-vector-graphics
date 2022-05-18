import { DVG } from '../../src/dvg'
import Component from '../../src/components/component'
import StyleComponent from '../../src/components/style'

test('DVG Components Tags', () => {
  document.body.innerHTML = `
<svg id="dvg_test" width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect id="rectangle" width="128" height="128" />
</svg>
`
  const svg = document.getElementById('dvg_test')
  const rectangle = document.getElementById('rectangle')
  if (svg && rectangle) {
    const dvg = new DVG(svg)
    const comp = new StyleComponent(rectangle)
    dvg.addComponents([comp])
    dvg.addComponents([new Component(rectangle)], [['tag a', 'tag b']])
    dvg.addComponents([new Component(rectangle), new Component(rectangle)], [['tag a'], ['tag b']])

    expect(dvg.getComponents().length).toBe(4)
    expect(dvg.getComponents(['tag b']).length).toBe(2)

    dvg.removeComponents(['tag b'])
    expect(dvg.getComponents().length).toBe(2)

    expect(dvg.getComponents(['tag a']).length).toBe(1)
    dvg.addComponentTags(comp, ['tag a'])
    expect(dvg.getComponents(['tag a']).length).toBe(2)

    dvg.addComponentTags(comp, ['tag a'])
    expect(dvg.getComponents(['tag a']).length).toBe(2)
    dvg.removeComponentTags(comp, ['tag a'])
    expect(dvg.getComponents(['tag a']).length).toBe(1)

    dvg.addComponents([new Component(rectangle), new Component(rectangle)], 'tag c')
    expect(dvg.getComponents('tag c').length).toBe(2)
    dvg.removeComponents('tag c')
    expect(dvg.getComponents(['tag c']).length).toBe(0)

    dvg.addComponents([new Component(rectangle), new Component(rectangle)], ['tag d','tag e'])
    expect(dvg.getComponents(['tag d']).length).toBe(2)
    expect(dvg.getComponents(['tag e']).length).toBe(2)
  }
})
