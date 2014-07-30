'use strict';

/**
 * @ngdoc directive
 * @name multiselectApp.directive:multiSelect
 * @description
 * # Angular Multi Select directive
 */
angular.module('shalotelli-angular-multiselect', [])
  .directive('multiSelect', [ '$timeout', function ($timeout) {
    return {
      templateUrl: function (element, attrs) {
        if (attrs.templatePath !== undefined) {
          return attrs.templatePath;
        }

        return 'bower_components/shalotelli-angular-multiselect/views/directives/multi-select.html';
      },
      
      restrict: 'E',
      replace: true,

      scope: {
        values: '=',
        model: '=',
        showFilters: '@',
        showOther: '@',
        otherDefaultValue: '@',
        otherDefaultValueType: '@',
        otherEvent: '@',
        valueField: '@',
        labelField: '@',
        templatePath: '@'
      },

      link: function multiSelectLink(scope, element, attrs) {
            // dropdown element
        var $dropdown = element.find('.multi-select-dropdown'),

            // container element
            $container = element.find('.multi-select-container'),

            // selections objects array
            selectedObjects = [],

            // "other" value buffer
            otherHistory = '',

            /*
              Display options in textbox
            */
            displayOptions = function displayOptions() {
              var labels = [];

              for (var i=0;i<selectedObjects.length;i++) {
                labels.push(selectedObjects[i][scope.labelField]);
              }

              $container.text(labels.join(', '));

              // emit data
              scope.$emit('multiSelectUpdate', labels.join(', '));
            },

            typecast = function typecast(value, type) {
              switch (type.toLowerCase()) {
                case 'string':
                case 'str':
                  value = String(value);
                  break;

                case 'integer':
                case 'int':
                  value = parseInt(value, 10);

                  if (isNaN(value)) {
                    value = 0;
                  }

                  break;

                case 'float':
                  value = parseFloat(value);
                  
                  if (isNaN(value)) {
                    value = 0.0;
                  }

                  break;

                case 'boolean':
                case 'bool':
                  switch (value.toLowerCase()) {
                    case 'true':
                    case '1':
                      value = true;
                      break;

                    case 'false':
                    case '0':
                    case null:
                      value = false;
                      break;

                    default:
                      value = Boolean(value);
                      break;
                  }

                  break;

                default:
                  value = String(value);
                  break;
              }

              return value;
            };

        // pre select items & populate "other" value (if found) after initial digest cycle
        $timeout(function() {
          angular.forEach(scope.values, function (value, key) {
            if (value.isSelected !== undefined && value.isSelected === true) {
              selectedObjects.push(value);
            } else if (scope.showOther && value[scope.valueField] == scope.otherDefaultValue) {
              scope.values.splice(key, 1);

              scope.other = value[scope.labelField];

              scope.doOther();
            }
          });
        }, 0);
        
        // initial output
        scope.model = selectedObjects;
        displayOptions();

        // show filters default value
        attrs.$observe('showFilters', function (showFilters) {
          scope.showFilters = showFilters || true;
        });

        // show other default value
        attrs.$observe('showOther', function (showOther) {
          scope.showOther = showOther || false;
        });

        // other default value type value
        attrs.$observe('otherDefaultValueType', function (otherDefaultValueType) {
          scope.otherDefaultValueType = otherDefaultValueType || 'string';
        });

        // other box event binding
        attrs.$observe('otherEvent', function (otherEvent) {
          if (otherEvent === undefined || ! otherEvent.match(/blur|keyup|enter/)) {
            otherEvent = 'keyup';
          }

          switch (otherEvent.toLowerCase()) {
            case 'blur':
            case 'keyup':
              angular.element('.multi-select-other').on(otherEvent, function () {
                scope.doOther();
              });
              break;

            case 'enter':
              angular.element('.multi-select-other').on('keydown keypress', function (e) {
                if (e.which === 13) {
                  e.preventDefault();
                  scope.doOther();
                }
              });
              break;

            default:
              break;
          }
        });

        // value field default value
        attrs.$observe('valueField', function (valueField) {
          scope.valueField = valueField || 'value';
        });

        // label field default value
        attrs.$observe('labelField', function (labelField) {
          scope.labelField = labelField || 'label';
        });

        // hide dropdown when clicking away
        angular.element(document).on('click', function (e) {
          if (e.target.className.indexOf('multi-select') === -1) {
            $dropdown.removeClass('show').addClass('hide');
          }
        });

        // show dropdown on focus
        scope.onFocus = function onFocus() {
          // close all other dropdowns on the page before showing the selected one
          angular.element('body').find('.multi-select-dropdown').removeClass('show').addClass('hide');
          $dropdown.removeClass('hide').addClass('show');
        };

        // select all options
        scope.selectAll = function selectAll() {
          var $el;

          // highlight all un-highlighted elements
          element.find('.multi-select-option-link').each(function () {
            $el = angular.element(this);

            if (! $el.hasClass('selected')) {
              $el.addClass('selected');
            }
          });

          // add all to selected objects buffer
          selectedObjects = scope.values;

          // update model
          scope.model = selectedObjects;

          // if other field, populate value
          scope.doOther();

          // output
          displayOptions();
        };

        // deselect all options
        scope.selectNone = function selectNone() {
          // remove highlighting from all elements
          element.find('.multi-select-option-link').each(function () {
            angular.element(this).removeClass('selected');
          });

          // reset data
          scope.model = [];
          selectedObjects = [];
          scope.other = '';

          // output
          displayOptions();
        };

        // select/deselect option
        scope.selectOption = function selectOption($event, option) {
          var $listOption = angular.element($event.target),
              values = [],
              i;

          // pluck values
          for (i=0;i<selectedObjects.length;i++) {
            values.push(selectedObjects[i][scope.valueField]);
          }

          // toggle option and highlighting
          if (values.indexOf(option[scope.valueField]) === -1) {
            selectedObjects.push(option);

            $listOption.addClass('selected');
          } else {

            for (i=0;i<selectedObjects.length;i++) {
              if(selectedObjects[i][scope.valueField] === option[scope.valueField]) {
                selectedObjects.splice(i, 1);
              }
            }

            $listOption.removeClass('selected');
          }

          // update model
          scope.model = selectedObjects;

          // output
          displayOptions();
        };

        // "other" field
        scope.doOther = function doOther() {
          var otherObj = {},
              value = '',

              copyAndDisplay = function copyAndDisplay() {
                // update model
                scope.model = selectedObjects;

                // output
                displayOptions();
              };

          // if otherHistory, remove from selected options array
          if (otherHistory.length > 0) {
            for (var i=0;i<selectedObjects.length;i++) {
              if(selectedObjects[i][scope.labelField] === otherHistory) {
                selectedObjects.splice(i, 1);
              }
            }
          }

          // if new other value, push to array otherwise reset history buffer
          if (scope.other !== undefined && scope.other.length > 0) {
            attrs.$observe('otherDefaultValue', function (otherDefaultValue) {
              scope.otherDefaultValue = otherDefaultValue;

              // add label to otherObj
              otherObj[scope.labelField] = scope.other;

              // set value
              value = (otherDefaultValue === undefined) ? scope.other : otherDefaultValue;

              // typecast value
              value = typecast(value, scope.otherDefaultValueType);
              
              // add value to otherObj
              otherObj[scope.valueField] = value;

              // flag as other
              otherObj.isOther = true;

              // add object
              selectedObjects.push(otherObj);
              
              otherHistory = otherObj[scope.labelField];

              copyAndDisplay();
            });
          } else {
            otherHistory = '';
            
            copyAndDisplay();
          }
        };
      }
    };
  }]);
