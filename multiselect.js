(function(ng){
'use strict';

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Function.method('curry', function () {
    var slice = Array.prototype.slice,
        args = slice.apply(arguments),
        that = this;
        return function () {
          return that.apply(null, args.concat(slice.apply(arguments)));
        };
});

/**
 * @ngdoc directive
 * @name multiselectApp.directive:multiSelect
 * @description
 * # Angular Multi Select directive
 */
ng.module('shalotelli-angular-multiselect', [])
  .directive('multiSelect', [ '$timeout', '$log',  function ($timeout, $log) {
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
        isSelected: '&',
        otherNgModel: '=',
        otherEvent: '@',
        valueField: '@',
        labelField: '@',
        templatePath: '@'
      },

      link: function multiSelectLink(scope, element, attrs) {
        // dropdown element
        var $dropdown = element.find('.multi-select-dropdown'),
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
              for (var i=0;i< scope.model.length;i++) {
                var selected = scope.model[i],
                    selectItem,
                    label = selected[scope.labelField];

                if(isOther(selected)){
                  label = selected[scope.otherNgModel];
                }else{
                  //if label is null find it in the other list and use it
                  selectItem = findInSelect(selected);
                  label = selectItem &&  selectItem[scope.labelField];
                }

                if(!label){
                  $log.error('Failed to find label for ',selected);
                  continue;
                }
                labels.push(label);
              }

              // emit data
              var result = labels.join(', ');
              scope.$emit(broadcastkey, result);
              $log.info(result);
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
              ng.element('.multi-select-other').on(otherEvent, function () {
                displayOptions();
              });
              break;

            case 'enter':
              ng.element('.multi-select-other').on('keydown keypress', function (e) {
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

        // value field default value
        attrs.$observe('isOtherField', function (valueField) {
          scope.isOtherField = valueField || 'isOther';
        });

        function isOther(item){
          return item[scope.isOtherField] === true;
        }

        // label field default value
        attrs.$observe('labelField', function (labelField) {
          scope.labelField = labelField || 'label';
        });

        // hide dropdown when clicking away
        ng.element(document).on('click', function (e) {
          if (e.target.className.indexOf('multi-select') === -1) {
            $dropdown.removeClass('show').addClass('hide');
          }
        });

        // show dropdown on focus
        scope.onFocus = function onFocus() {
          // close all other dropdowns on the page before showing the selected one
          ng.element('body').find('.multi-select-dropdown').removeClass('show').addClass('hide');
          $dropdown.removeClass('hide').addClass('show');
        };

        // select all options
        scope.selectAll = function selectAll() {
          //clear all first
          scope.model.length = 0;
          ng.forEach(scope.values,function(item){
            if(isOther(item)){
              return;
            }
            scope.selectOption(item);
          });
        };


        // deselect all options
        scope.selectNone = function selectNone() {
          // remove highlighting from all elements
          // reset data
          scope.model.length = 0;
        };

        var _find = function(collection, item){
          collection  = collection ||[];

          var selected;
          for (var i=0;i< collection.length;i++) {
            selected= collection[i];
            if(item[scope.valueField] === selected[scope.valueField]){
              return selected;
            }
          }
        };

        var findItem = _find.curry(scope.model);
        var findInSelect = _find.curry(scope.values);



        /*
        * returns whether or not its selected
        * is to default the select to checked when input changes but they dont click it
        */
        if(!attrs.isSelected){
          scope.isSelected = function(item){
            var found = findItem(item);
            if(found && isOther(found)){
              return item;
            }
          };
        }

        // select/deselect option
        scope.selectOption = function selectOption(option) {
          var item = findItem(option);
          if(item){
            item = ng.copy(item);
            scope.model.push(item);
          }else{
            scope.model.pop(item);
          }
        };

      }
    };
  }]);
})(angular);
