angular-multiselect
===================

A multi select drop down list directive for AngularJS. This directive takes an array of value/label objects and formats them as a drop down list where multiple options can be selected. It also has shortcut filters to select all and select none, and an optional text box to enter new values. The element returns an array of selected objects to the specified model.

# Installation

## Bower
```$ bower install shalotelli-angular-multiselect```

## Manual
1. ```$ git clone https://github.com/shalotelli/angular-multiselect.git```
2. ```<script src="path/to/angular-multiselect/multiselect.js">```
3. ```<link rel="stylesheet" href="path/to/angular-multiselect/styles/multi-select.css">```

# Usage

To use this directive, call the multi-select tag, including the model with the array of data objects, a reference to the output model and any display options (listed below).

```<multi-select
  values="values"
  model="multiselect"
  show-filters="true"
  show-other="true">
</multi-select>```

