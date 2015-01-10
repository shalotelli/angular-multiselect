(function (ng) {
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
    .provider('multiSelectConfig', function MultiSelectConfig () {
      var defaults = {
        templatePath: 'bower_components/shalotelli-angular-multiselect/views/directives/multi-select.html',
        otherField: 'isOther',
        otherNgModel: 'other',
        closeOnSelect: false,
        dataThreshold: 1000
      };

      /**
       * Set defaults
       * @param {Object} settings Settings object
       */
      this.setDefaults = function (settings) {
        angular.extend(defaults, settings || {});
      };

      this.$get = [ function () {
        return defaults;
      }];
    })
    .directive('multiSelect', [ 'multiSelectConfig', '$timeout', '$log',  function (multiSelectConfig, $timeout, $log) {
      return {
        templateUrl: function (element, attrs) {
          if (attrs.templatePath !== undefined) {
            return attrs.templatePath;
          }

          return multiSelectConfig.templatePath;
        },

        restrict: 'E',
        replace: true,

        scope: {
          values: '=',
          model: '=',
          name: '@',
          showFilters: '@',
          showOther: '@',
          isSelected: '&',
          otherNgModel: '@',
          otherField: '@',
          otherEvent: '@',
          valueField: '@',
          labelField: '@',
          templatePath: '@',
          closeOnSelect: '@',
          emitOnSelect: '@',
          showBigDataConfirm: '@'
        },

        link: function multiSelectLink (scope, element, attrs) {
          // dropdown element
          var $dropdown = element.find('.multi-select-dropdown'),

             /**
              * Display options in textbox
              * @return {String} Display string
              */
              displayOptions = function displayOptions () {
                var broadcastkey = 'multiSelectUpdate',
                    label = '';

                if (scope.model.length === 1) {
                  label = scope.model[0][scope.labelField];
                } else if (scope.areAllSelected() && scope.model.length) {
                  label = 'All Selected';
                } else if (scope.model.length > 1) {
                  label = scope.model.length + ' Selected';
                } else {
                  label = 'None Selected';
                }

                if (attrs.name !== undefined) {
                  broadcastkey += '_' + attrs.name;
                }

                // emit data
                scope.$emit(broadcastkey, label);

                return label;
              },

              // check all selected options
              checkSelectedOptions = function () {
                scope.selectedOptions = [];

                ng.forEach(scope.model, function (option) {
                  scope.selectedOptions[option[scope.valueField]] = true;
                });
              },

              isOptionSelected = function (option) {
                return scope.selectedOptions[option[scope.valueField]];
              };

          scope.displayOptions = displayOptions;

          scope.isOptionSelected = isOptionSelected;

          var watch = scope.$watch('model', function (newVal, oldVal) {
            if (ng.isDefined(newVal)) {
              if (newVal.length) {
                // if we have something display
                // first time intiialized go ahead an sync other
                var other = findOther();

                if (other) {
                  scope.shared.other = other[scope.otherNgModel] || '';
                }
              }

              // kill watch
              watch();
            }
          });

          // array of selected options
          scope.selectedOptions = [];

          // show filters default value
          attrs.$observe('showFilters', function (showFilters) {
            // if the array of data is big enough to cause a lag when filters are
            // checked, set this flag
            scope.bigData = !!(scope.values.length > multiSelectConfig.dataThreshold);

            // if no showFilters flag set, determine visibility off bigData flag
            // (if bigData is true, its safer to not show filters)
            scope.showFilters = showFilters || !scope.bigData;
          });

          // show other default value
          attrs.$observe('showOther', function (showOther) {
            scope.showOther = showOther || false;
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

          attrs.$observe('otherField', function (otherField) {
            scope.otherField = otherField || multiSelectConfig.otherField;
          });

          attrs.$observe('closeOnSelect', function (closeOnSelect) {
            scope.closeOnSelect = (closeOnSelect === 'true') || multiSelectConfig.closeOnSelect;
          });

          attrs.$observe('emitOnSelect', function (emitOnSelect) {
            scope.emitOnSelect = (emitOnSelect === 'true') || multiSelectConfig.emitOnSelect;
          });

          attrs.$observe('showBigDataConfirm', function (showBigDataConfirm) {
            scope.showBigDataConfirm = (showBigDataConfirm === 'true') || true;
          });

          /**
           * Is item the Other field
           * @param  {Object}  item Item object
           * @return {Boolean}      Is other
           */
          function isOther (item) {
            return item[scope.otherField] === true;
          }

          scope.isOther = isOther;

          // label field default value
          attrs.$observe('otherNgModel', function (otherNgModel) {
            scope.otherNgModel = otherNgModel || multiSelectConfig.otherNgModel;
          });

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

          /**
           * Close dropdown when user presses Enter key
           * @param  {Object} $event Event
           */
          scope.close = function ($event) {
            //this should be migrated to use angualar
            if ($event.which === 13) {
              $event.preventDefault();
              $dropdown.removeClass('show').addClass('hide');
            }
          };

          /**
           * Show/hide dropdown
           */
          scope.toggleDropdown = function toggleDropdown () {
            if ($dropdown.hasClass('hide')) {
              // close all other dropdowns on the page before showing the selected one
              ng.element('body').find('.multi-select-dropdown').removeClass('show').addClass('hide');
              $dropdown.removeClass('hide').addClass('show');
            } else {
              $dropdown.removeClass('show').addClass('hide');
            }
          };

          /**
           * Select/Deselect all options
           */
          scope.selectAll = function selectAll () {
            var areAllSelected = scope.areAllSelected(),
                doSelectAll = function () {
                  //clear all first
                  scope.model.length = 0;

                  if (! areAllSelected) {
                    ng.forEach(scope.values, function (item) {
                      if (isOther(item)) {
                        return;
                      }

                      scope.selectOption(item);
                    });
                  } else {
                    scope.allSelected = true;
                    clearOther();
                    checkSelectedOptions();
                  }
                };

            if (scope.bigData && scope.showBigDataConfirm) {
              var confirmBigDataAction = confirm('Due to the amount of data in the dropdown, the current action may temporarily slow down your system. Do you want to continue?');

              if (confirmBigDataAction) {
                doSelectAll();
              }
            } else {
              doSelectAll();
            }
          };

          /**
           * Click select all checkbox
           * @param  {Object} $event Event
           */
          scope.clickSelectAllCheckbox = function clickSelectAllCheckbox ($event) {
            $event.stopPropagation();
            scope.selectAll();
          };

          /**
           * Check if all values are selected
           * @return {Boolean}
           */
          scope.areAllSelected = function areAllSelected () {
            var _allSelected = false,
            valueCount = scope.values.length,
            modelCount = scope.model.length,
            $checkbox = $dropdown.find('.multi-select-select-all-checkbox');

            for (var i = 0; i < values.length; i++) {
              if (isOther(values[i])) {
                valueCount--;
              }
            }

            modelCount = models.length;
            for (var j = 0; j < model.length; j++) {
              if (isOther(model[j])) {
                modelCount --;
              }
            }

            _allSelected = (modelCount === valueCount);

            // if some are selected, put checkbox in indeterminate mode
            if (!(_allSelected) && model.length > 0) {
              $checkbox.prop('indeterminate', true);
            } else {
              $checkbox.prop('indeterminate', false);
            }

            return _allSelected;
          };

          /**
           * Find other value
           * @return {Object} Other object
           */
          var findOther = function () {
            var selected;

            for (var i=0;i< scope.model.length;i++) {
              selected = scope.model[i];

              if (isOther(selected)) {
                return selected;
              }
            }
          };

          /**
          * Helper to find object in array
          * @param  {Array} collection  Haystack
          * @param  {Object} item      Needle
          * @return {Object}            Found object
          */
          var _find = function (collection, item) {
            var selected;

            collection  = collection || [];

            for (var i=0;i<collection.length;i++) {
              selected = collection[i];

              if (item[scope.valueField] === selected[scope.valueField]) {
                return selected;
              }
            }
          };

          var findItem = function(item) {
            return _find(scope.model, item);
          };

          var findInSelect = function(item) {
            return _find(scope.values, item);
          };

          scope.shared = { other : '' };

          /**
           * Clear other option
           */
          function clearOther () {
            scope.shared = { other : '' };
          }

          /**
           * Sync other value
           * @param  {Object} option Option object
           */
          scope.syncOther = function (option) {
            var selected = findItem(option);

            if (selected) {
              //toggle it off
              if (! scope.shared.other) {
                selected = scope.selectOption(option);
              }
            } else {
              if (scope.shared.other) {
                //only select it if there is text
                selected = scope.selectOption(option);
              }
            }

            if (selected) {
              selected[scope.otherNgModel] = scope.shared.other;
            }
          };

          // returns whether or not its selected
          // is to default the select to checked when input changes but they dont click it
          if (! attrs.isSelected) {
            checkSelectedOptions();
          }

          /**
           * Click option checkbox
           * @param  {Object} $event Event
           * @param  {Object} value  Option object
           */
          scope.clickCheckbox = function ($event, value) {
            $event.stopPropagation();
            scope.selectOption(value);
          };

          /**
           * select/deselect option
           * @param  {Object} option Option object
           * @return {Object}        Item object
           */
          scope.selectOption = function selectOption (option) {
            var item = findItem(option),
                broadcastkey = 'multiSelectOption';

            if (item) {
               scope.model.splice(scope.model.indexOf(item), 1);
               delete scope.selectedOptions[item[scope.valueField]];

               if (isOther(item)) {
                 clearOther();
               }
            } else {
              item = ng.copy(option);
              scope.model.push(item);
              scope.selectedOptions[item[scope.valueField]] = true;
            }

            // close dropdown?
            if (scope.closeOnSelect) {
              $dropdown.removeClass('show').addClass('hide');
            }

            scope.allSelected = scope.areAllSelected();

            if (scope.emitOnSelect) {
              if (attrs.name !== undefined) {
                broadcastkey += '_' + attrs.name;
              }

              scope.$emit(broadcastkey, scope.model, option);
            }

            return item;
          };

          if (scope.model.length > 0) {
            scope.allSelected = scope.areAllSelected();
          }

          // useful if there's more than one multi select on a page
          scope.$on('multiSelectClearAll', function () {
            scope.model.length = 0;

            $timeout(function () {
              checkSelectedOptions();
              scope.allSelected = scope.areAllSelected();
              clearOther();
            });
          });

          // clear multi select, reference by name
          scope.$on('multiSelectClear', function (event, name) {
            if (scope.name && scope.name === name) {
              scope.model.length = 0;

              $timeout(function () {
                checkSelectedOptions();
                scope.allSelected = scope.areAllSelected();
                clearOther();
              });
            }
          });

          scope.$on('multiSelectRefreshAll', function () {
            $timeout(function () {
              checkSelectedOptions();
            });
          });

          scope.$on('multiSelectRefresh', function (event, name, options) {
            if (scope.name && scope.name === name) {
              // check if options are passed
              if (options !== undefined) {
                scope.model = options;
              }

              $timeout(function () {
                checkSelectedOptions();
              });
            }
          });
        }
      };
    }]);
})(angular);
