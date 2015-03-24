angular-multiselect
===================

A multi select drop down list directive for AngularJS. This directive takes an array of value/label objects and formats them as a drop down list where multiple options can be selected. It also has shortcut filters to select all and select none, and an optional text box to enter new values. The element returns an array of selected objects to the specified model.

# Demo

View the demo on Plunker: http://plnkr.co/edit/7LHuN1t5eHe9iNyTw7MV?p=preview

# Installation

### Bower
```bash
$ bower install shalotelli-angular-multiselect
```

### Manual
```bash
1. $ git clone https://github.com/shalotelli/angular-multiselect.git
2. <script src="path/to/shalotelli-angular-multiselect/multiselect.js">
3. <link rel="stylesheet" href="path/to/shalotelli-angular-multiselect/styles/multi-select.css">
4. Add module shalotelli-angular-multiselect to dependencies list
```

# Usage

To use this directive, call the multi-select tag, including the model with the array of data objects, a reference to the output model and any display options (listed below).

To prepopulate items, add them to model.

```html
<multi-select
  values="values"
  model="output"
  show-filters="true"
  other-field="isOther"
  other-ng-model="other"
  show-other="true">
</multi-select>
```

# Config

These are default configuration variables that can be overriden via the ```multiSelectConfigProvider```.

| Key | Values | Description | Default Value |
|-----|--------|-------------|---------------|
| templatePath | string | Path to template file | bower_components/shalotelli-angular-multiselect/views/directives/multi-select.html |
| otherField | string | Name of other field scope variable | isOther |
| otherNgModel | string | Other scope model | other |
| closeOnSelect | boolean | Should the dropdown close when an option is selected | false |

# Options

| Option | Values | Description | Required | Default Value |
|--------|--------|-------------|----------|---------------|
| values | array/object | Values to load in to drop down | yes | - |
| model | array | ngModel to save output to, anything in here also shows up as selected | yes | - |
| name | string | Unique identifier (useful if there is more than one multiselect on the page) | no | - |
| show-filters | boolean | Show select all/select none | no | true |
| show-filters | boolean | Show close button | no | true |
| show-other | boolean | Enable user to enter custom values | no | false |
| is-selected | boolean | Default the select to checked when input changes but they dont click it | no | false |
| other-ng-model| string |field to save the other value to  | no | undefined |
| other-field | string | Name of the field that indicates this is the other option e.g. isOther | no | 'isOther' |
| other-event | string | Determine when to show an entered "other" value | no | 'keyup' |
| value-field | string | Specify the key to use as the value field | no | value |
| label-field | string | Specify the key to use as the label field | no | label |
| template-path | string | Specify an alternate view template path for the directive | no | bower_components/shalotelli-angular-multiselect/views/directives/multi-select.html |
| close-on-select | boolean | Should the dropdown close after each selection | no | false |
| emit-on-select | boolean | Emit a message when an option is selected/deselected | no | false |
| disabled | boolean | Disable element | no | false |
| loading | boolean | Disable element and show loading indicator | no | false |

# Events

Event messages can be fired when the dropdown updates itself. **If the dropdown has a name attribute, append *_[name]* to the listener to capture the event.**

```html
<multi-select
  name="demo"
  values="values"
  model="output"
  show-filters="true"
  other-field="isOther"
  other-ng-model="other"
  show-other="true">
</multi-select>
```

```javascript
$scope.$on('multiSelectOption_demo', function (event, model, option) {
  console.log(event, model, option);
});
```

| Event | Data | Description |
|-------|------|-------------|
| multiSelectUpdate | label | Event emitted when display is updated. *label* holds the dropdowns display label |
| multiSelectOption | model, option | Event emitted when a option is selected/deselected. This will only be emitted if ```emit-on-select``` is ```true``` |
| multiSelectDropdownOpen | - | Event emmited when elements dropdown opens. This event only fires if the element has a name attribute |

# Listeners

Listeners are called when certain events are fired.

```html
<multi-select
  name="demo"
  values="values"
  model="output"
  show-filters="true"
  other-field="isOther"
  other-ng-model="other"
  show-other="true">
</multi-select>
```

```javascript
$scope.$emit('multiSelectRefresh', 'demo', { label: 'Option 1', value: 1 });
```

| Event | Data | Description |
|-------|------|-------------|
| multiSelectClearAll | - | Clear all multi selects on the screen. Handy if there is more than one. |
| multiSelectClear | name | Clear a multi selects options, referenced by the name attribute. |
| multiSelectRefreshAll | - | Refresh all multi select options on the page. Handy if there is more than one. This listener should be called if the model is updated outside the directive. |
| multiSelectRefresh | name, options | Refresh a multi selects options, referenced by the name attribute. This listener should be called if the model is updated outside the directive. |
