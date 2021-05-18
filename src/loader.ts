const LOADER_ID = '____dvgloader____'

const DEFAULT_LOADER_SVG = `
<style>
  @keyframes rotation {
    from {
      transform: translate(50%,50%) translate(-72px,-72px) rotate(0deg);
    }
    to {
      transform: translate(50%,50%) translate(-72px,-72px) rotate(359deg);
    }
  }
</style>
<g style="transform-origin: 72px 72px; animation: rotation 4s infinite linear;">
<radialGradient id="glow_1_" cx="71.7698" cy="72" r="72.0287" gradientUnits="userSpaceOnUse">
	<stop  offset="0.3871" style="stop-color:#000000;stop-opacity:0"/>
	<stop  offset="0.5327" style="stop-color:#000000;stop-opacity:0.99"/>
	<stop  offset="0.8602" style="stop-color:#000000;stop-opacity:0.99"/>
	<stop  offset="1" style="stop-color:#000000;stop-opacity:0"/>
</radialGradient>
<path id="glow" style="opacity:0.15;fill:url(#glow_1_);" d="M72,144c-39.7,0-72-32.3-72-72S32.3,0,72,0s72,32.3,72,72
	S111.7,144,72,144z M72,44c-15.44,0-28,12.56-28,28s12.56,28,28,28s28-12.56,28-28S87.44,44,72,44z"/>
<path id="ring" style="opacity:0.7;fill:#FFFFFF;" d="M72,134c-34.19,0-62-27.81-62-62s27.81-62,62-62s62,27.81,62,62
	S106.19,134,72,134z M72,34c-20.95,0-38,17.05-38,38s17.05,38,38,38s38-17.05,38-38S92.95,34,72,34z"/>
<g id="_x7B__x7B_loadanim:rotate_x7D__x7D_">
	<g id="boundingBox_1_" style="opacity:0;">
		<circle style="fill:#FFFFFF;" cx="72" cy="72" r="50"/>
	</g>
	<g id="segmentedGradientRing" style="opacity:0.7;">
		<path style="opacity:0;" d="M120.69,84.4c-2.59-0.94-5.46,0.39-6.41,2.99l9.4,3.42C124.63,88.22,123.29,85.35,120.69,84.4z"/>
		<path style="opacity:0.05;" d="M123.68,90.81l-9.4-3.42c0,0,0,0,0,0c-0.91,2.49-2.03,4.86-3.33,7.1l8.66,5
			C121.2,96.75,122.58,93.85,123.68,90.81C123.68,90.81,123.68,90.81,123.68,90.81z"/>
		<path style="opacity:0.1;" d="M106.46,100.91l7.66,6.42c2.05-2.43,3.89-5.06,5.5-7.85l-8.66-5
			C109.64,96.77,108.13,98.92,106.46,100.91z"/>
		<path style="opacity:0.15;" d="M100.9,106.44l6.42,7.65c2.45-2.05,4.72-4.31,6.79-6.76l-7.66-6.42
			C104.77,102.92,102.9,104.77,100.9,106.44z"/>
		<path style="opacity:0.2;" d="M94.48,110.94l5,8.65c2.77-1.6,5.39-3.44,7.85-5.49l-6.42-7.65
			C98.9,108.13,96.75,109.63,94.48,110.94z"/>
		<path style="opacity:0.25;" d="M87.38,114.27l3.42,9.39c3.01-1.1,5.91-2.47,8.68-4.07l-5-8.65
			C92.22,112.25,89.85,113.37,87.38,114.27z"/>
		<path style="opacity:0.3;" d="M79.81,116.3l1.74,9.85c3.17-0.56,6.27-1.4,9.25-2.49l-3.42-9.39
			C84.94,115.16,82.41,115.84,79.81,116.3z"/>
		<path style="opacity:0.35;" d="M72,117v10c3.24,0,6.43-0.3,9.55-0.85l-1.74-9.85C77.26,116.76,74.65,117,72,117z"/>
		<path style="opacity:0.4;" d="M64.19,116.31l-1.74,9.85c3.1,0.55,6.29,0.85,9.55,0.85v-10C69.33,117,66.73,116.75,64.19,116.31z"
			/>
		<path style="opacity:0.45;" d="M56.61,114.29l-3.42,9.4c2.98,1.09,6.07,1.91,9.26,2.47l1.74-9.85
			C61.58,115.85,59.04,115.18,56.61,114.29z"/>
		<path style="opacity:0.5;" d="M49.51,110.95l-5,8.66c2.75,1.6,5.65,2.97,8.68,4.08l3.42-9.4
			C54.13,113.38,51.76,112.26,49.51,110.95z"/>
		<path style="opacity:0.55;" d="M43.09,106.45l-6.42,7.66c2.44,2.05,5.07,3.89,7.85,5.5l5-8.66
			C47.24,109.64,45.09,108.13,43.09,106.45z"/>
		<path style="opacity:0.6;" d="M37.55,100.91l-7.66,6.42c2.06,2.45,4.33,4.72,6.77,6.78l6.42-7.66
			C41.09,104.77,39.23,102.91,37.55,100.91z"/>
		<path style="opacity:0.65;" d="M33.05,94.49l-8.66,5c1.61,2.78,3.45,5.4,5.5,7.85l7.66-6.42C35.87,98.91,34.36,96.76,33.05,94.49z
			"/>
		<path style="opacity:0.7;" d="M29.71,87.39l-9.4,3.42c1.11,3.03,2.48,5.92,4.08,8.68l8.66-5C31.74,92.24,30.62,89.87,29.71,87.39z
			"/>
		<path style="opacity:0.75;" d="M27.69,79.81l-9.85,1.74c0.56,3.19,1.38,6.29,2.47,9.26l9.4-3.42
			C28.82,84.96,28.15,82.42,27.69,79.81z"/>
		<path style="opacity:0.8;" d="M27,72H17c0,3.26,0.3,6.44,0.85,9.55l9.85-1.74C27.25,77.27,27,74.67,27,72z"/>
		<path style="opacity:0.85;" d="M17,72h10c0-2.67,0.25-5.27,0.69-7.81l-9.85-1.74C17.3,65.56,17,68.74,17,72z"/>
		<path style="opacity:0.9;" d="M20.32,53.19c-1.09,2.98-1.91,6.07-2.47,9.26l9.85,1.74c0.46-2.61,1.13-5.14,2.02-7.58L20.32,53.19z
			"/>
		<path style="opacity:0.95;" d="M33.05,49.51l-8.66-5c-1.6,2.75-2.97,5.65-4.08,8.68l9.4,3.42C30.62,54.13,31.74,51.76,33.05,49.51
			z"/>
		<path d="M72,27c18.85,0,35.84,11.9,42.29,29.61c0.94,2.6,3.82,3.93,6.41,2.99c2.59-0.94,3.93-3.81,2.99-6.41
			C115.8,31.54,95.04,17,72,17c-20.32,0-38.09,11.08-47.61,27.51l8.66,5C40.84,36.07,55.38,27,72,27z"/>
	</g>
</g>
</g>
`

export function getLoader(svg: SVGSVGElement) {
  let loader = svg.getElementById(LOADER_ID) as SVGElement
  if (!loader) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.id = LOADER_ID
    group.innerHTML = DEFAULT_LOADER_SVG
    svg.append(group)
    loader = group
  }
  return loader
}
