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
        name: '@',
        showFilters: '@',
        showOther: '@',
        otherDefaultValueType: '@',
        otherNgModel: '=',
        otherEvent: '@',
        valueField: '@',
        labelField: '@',
        templatePath: '@'
      },

      link: function multiSelectLink(scope, element, attrs) {
            // dropdown element
        var $dropdown = element.find('.multi-select-dropdown'),
            // "other" value buffer
            otherHistory = '',

            /*
              Display options in textbox
            */
            displayOptions = function displayOptions() {
              var labels = [],
                  broadcastkey = 'multiSelectUpdate';

              if (attrs.name !== undefined) {
                broadcastkey += '_' + attrs.name;
              }

              //this is suboptimal (not a lot of time to fix this)
              syncModel();
              for (var i=0;i< scope.model.length;i++) {
                var selected = scope.model[i],
                  label = selected[scope.labelField];

                if(selected && selected.IsOther){
                  label = selected[scope.otherNgModel];
                }

                labels.push(label);
              }

              // emit data
              var result = labels.join(', ');
              scope.$emit(broadcastkey, result);
              return result;
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

        scope.displayOptions = displayOptions;

        // let things digest, then throw them up
        $timeout(function () {
          //scope.model = selectedObjects;
          displayOptions();
        }, 0);

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
                displayOptions();
              });
              break;

            case 'enter':
              angular.element('.multi-select-other').on('keydown keypress', function (e) {
                if (e.which === 13) {
                  e.preventDefault();
                  displayOptions();
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

          // add all to selected objects buffer
          angular.forEach(scope.values,function(item){
              if(item.IsOther){
                return;
              }

              item.isSelected = true;
          });

          // output
          displayOptions();
        };

        // deselect all options
        scope.selectNone = function selectNone() {
          // remove highlighting from all elements
          // reset data
          if(scope.showOther){
            clear();
          }
          // output
          displayOptions();
        };
        function clear(){
          angular.forEach(scope.values, function(item){
              if(item.IsOther){
                item[scope.otherNgModel] = '';
              }
              item.isSelected = false;
          });
        }

        var syncModel = function(){
          scope.model.length = 0;
          angular.forEach(scope.values, function(item){
            if(item.isSelected || (item.IsOther && item[scope.otherNgModel])){
                scope.model.push(item);
            }
          });
        };

        // select/deselect option
        scope.selectOption = function selectOption($event, option) {
          var $listOption = angular.element($event.target),
              values = [],
              i;
          option.isSelected = !option.isSelected;
          if(option.IsOther && !option.isSelected){
            option[scope.optionNgModel] = '';
          }
          displayOptions();
        };

      }
    };
  }]);
