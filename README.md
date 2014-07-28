angular-multiselect
===================

A multi select drop down list directive for AngularJS. This directive takes an array of value/label objects and formats them as a drop down list where multiple options can be selected. It also has shortcut filters to select all and select none, and an optional text box to enter new values. The element returns an array of selected objects to the specified model.

# Installation

### Bower
```
$ bower install shalotelli-angular-multiselect
```

### Manual
```
1. $ git clone https://github.com/shalotelli/angular-multiselect.git
2. <script src="path/to/shalotelli-angular-multiselect/multiselect.js">
3. <link rel="stylesheet" href="path/to/shalotelli-angular-multiselect/styles/multi-select.css">
4. Add module shalotelli-angular-multiselect to dependencies list
```

# Usage

To use this directive, call the multi-select tag, including the model with the array of data objects, a reference to the output model and any display options (listed below).

```
<multi-select
  values="values"
  model="multiselect"
  show-filters="true"
  show-other="true">
</multi-select>
```

# Options

| Option | Values | Description | Required | Default Value |
|--------|--------|-------------|----------|---------------|
| values | array/object | Values to load in to drop down | yes | - |
| model | array | ngModel to save output to | yes | - |
| show-filters | boolean | Show select all/select none | no | true |
| show-other | boolean | Enable user to enter custom values | no | false |
| other-default-value | string | Set a custom default value for the "other" option, useful when you want to identify new entries with a specific id etc | no | _label value_ |
| other-default-value-type | string/integer/float/boolean | Typecast default other value | no | string |
| other-event | keyup/blur/enter | Event used to execute "other" field interaction | no | keyup |
| value-field | string | Specify the key to use as the value field | no | value |
| label-field | string | Specify the key to use as the label field | no | label |
| template-path | string | Specify an alternate view template path for the directive | no | bower_components/shalotelli-angular-multiselect/views/directives/multi-select.html |
