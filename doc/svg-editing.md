<!-- {% raw %} -->

# Editing SVG Files

To make your SVG file dynamic it must be correctly annotated. Any vector editing software that allows the ids of the elements to be set by the user may be used to add the annotations.

**_Adding Annotation to SVG Element Id_**<br/>
![](edit-annotate.gif)

Different SVG editors have different export behavior, but be sure through the export options that these three things are true:

- The ids are exported into the SVG.
- Elements that aren't visible are still exported.
- Text is not converted into fixed outlines (if you want the text to be dynamic).

In order to allow dynamic loading of fonts we currently only support [Google Fonts](https://fonts.google.com/) in the dynamic SVGs. The system will automatically look up and load any fonts you use and results will match as long as you download and use the Google font locally for your design. Some tools like Figma automatically use the Google Font library which is convenient.

### Adobe Illustrator Guide

Illustrator has a few ways to create SVG output. In order to preserve IDs and create the correct output you should use the File > Save a copy... action and set the format to "SVG (svg)". You will then be shown the "SVG Options" dialog and should use these settings:

- SVG Profiles: SVG 1.1
- Fonts
  - Type: SVG
  - Subsetting: None
- Options
  - Image Location: Embed
- Advanced Options
  - CSS Properties: Presentation Attributes
  - Output fewer tspan elements: True
  - Use textPath element for Text on Path: True
  - Responsive: True

### Figma Guide

Figma's export feature is applied to frames directly. First select the frame to export then under the "Export" section of options add a new export target, set the type to SVG, and use these settings (found in the overflow menu):

- Include "Id" attribute: True
- Outline Text: False

<!-- {% endraw %} -->
