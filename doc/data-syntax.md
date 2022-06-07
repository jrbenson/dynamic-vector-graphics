<!-- {% raw %} -->

# Data Annotation Syntax

As much as possible the system tries to keep all annotation context contained within the SVG file. However, for numerics, it is not always the case that the current minimum and maximum value in the data is the range in which it should be displayed. Therefore some annotations have to be provided in the data itself.

`NAME {{MIN..MAX}}` <br/>
In order to tell the dynamic object what the correct minimum and maximum for numeric columns should be the range expression within a double brace annotation must be included in the name. The annotation will be removed and so will not be part of the displayed name.

As an example a data item with the name `Expenses` would need to be renamed `Expenses {{0..1000}}` in order for it to be successfully understood by the dynamic SVG system.

<!-- {% endraw %} -->
