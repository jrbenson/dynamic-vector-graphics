import * as fs from 'fs'
import fetch from 'node-fetch'

const args = process.argv.slice(2)

if (args[0]) {
  fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${args[0]}`)
    .then((response) => response.json())
    .then((data) => {
      const families = data.items.map((i) => `'${i.family.toLowerCase()}'`)
      fs.writeFile('./src/utils/font-families.ts', `export const FONT_FAMILIES = [${families.join(',')}]`, (err) => {
        if (err) {
          console.log(err)
        }
      })
    })
} else {
  console.log('Google Fonts API key required as argument.')
}
