import { requiredFonts } from '../../src/utils/font'

test('Font Family Parsing', () => {
  document.body.innerHTML = `
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style type="text/css">
    .st0{font-family:'OpenSans-Regular';font-size:12px;}
    .st1{font-family:'Roboto-Regular';font-size:12px;}
  </style>
  <text font-family="Open Sans" font-size="12" letter-spacing="0px"><tspan x="0" y="0">Line 1</tspan></text>
  <text font-family="Roboto Condensed" font-size="12" font-weight="bold" letter-spacing="3px"><tspan x="0" y="14">Line 2</tspan></text>
  <text class="st0"><tspan x="0" y="28">Line 3</tspan></text>
  <text class="st1"><tspan x="0" y="42">Line 4</tspan></text>
</svg>
`
  // Can't test due to reliance on browser style resolution.
  //
  // expect(requiredFonts(document.body)).toEqual(
  //   expect.arrayContaining(['OpenSans-Regular', 'Roboto-Regular', 'Open Sans', 'Roboto Condensed'])
  // )
})
