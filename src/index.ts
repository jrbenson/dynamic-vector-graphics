export {DynamicSVG} from './dynamic-svg'
export {Data} from './data/data'

// (window as any).DynamicSVG = DynamicSVG
   
// /**
//  * DOM loaded callback to kick off initialization and callback registration.
//  */
// document.addEventListener('DOMContentLoaded', function () {
//   let dynSVG = new DynamicSVG(document.body)

//   // If run outside of VA assume in a testing scenario
//   if (!inIframe()) {
//     dynSVG.onDataReceived(SAMPLE_MESSAGE_2)
//   }
// })

// /**
//  * Test if page contained in an iFrame.
//  *
//  * @return Indicator of iFrame containment.
//  */
// export function inIframe(): boolean {
//   try {
//     return window.self !== window.top
//   } catch (e) {
//     return true
//   }
// }
