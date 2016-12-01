angular.module("shalotelli-angular-multiselect.templates",[]).run(["$templateCache",function(e){e.put("/directives/multi-select.html",'<div class="multi-select"><input type="text" class="form-control multi-select-container" ng-click="toggleDropdown()" value="{{displayOptions()}}" placeholder="None Selected" ng-disabled="disabled || loading" readonly="readonly"><div class="multi-select-dropdown hide"><div class="multi-select-filters"><span class="multi-select-filter" ng-click="selectAll()" ng-show="showFilters"><input type="checkbox" ng-model="allSelected" ng-click="clickSelectAllCheckbox($event)" class="multi-select-select-all-checkbox"> Select All</span> <button class="close-btn" ng-show="showCloseBtn">Close</button></div><!-- ./multi-select-filters --><ul><li class="multi-select-option" ng-repeat="value in values"><a class="multi-select-option-link" href="javascript:;" ng-if="!isOther(value)" ng-click="selectOption(value)" ng-class="{selected: isSelected(value)}"><input type="checkbox" ng-checked="isOptionSelected(value)" ng-click="clickCheckbox($event, value)"> {{value[labelField]}}</a><!-- ./multi-select-option-link --><div class="multi-select-other-container" ng-if="showOther && isOther(value)"><input type="text" class="form-control multi-select-other" placeholder="Other" ng-change="syncOther(value)" ng-keypress="close($event)" ng-model="shared.other"></div><!-- ./multi-select-other-container --></li><!-- ./multi-select-option --></ul></div><!-- ./multi-select-dropdown --></div>')}]);
(function (ng) {
  'use strict';

  /**
   * @ngdoc directive
   * @name multiselectApp.directive:multiSelect
   * @description
   * # Angular Multi Select directive
   */
  ng.module('shalotelli-angular-multiselect', ['shalotelli-angular-multiselect.templates'])
    .provider('multiSelectConfig', function MultiSelectConfig () {
      var defaults = {
        templatePath: '/directives/multi-select.html',
        otherField: 'isOther',
        otherNgModel: 'other',
        closeOnSelect: false
      };

      /**
       * Set defaults
       * @param {Object} settings Settings object
       */
      this.setDefaults = function setDefaults (settings) {
        angular.extend(defaults, settings || {});
      };

      this.$get = [ function () {
        return defaults;
      }];
    })
    .directive('multiSelect', [ 'multiSelectConfig', '$timeout', '$log', '$window', function multiSelect (multiSelectConfig, $timeout, $log, $window) {
      return {
        templateUrl: function templateUrl (element, attrs) {
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
          showFilters: '=',
          showCloseBtn: '@',
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
          disabled: '=',
          loading: '='
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
                
                if (scope.disabled) {
                  label = 'None Available';
                } else if (scope.loading) {
                  label = 'Loading...';
                } else if (scope.model.length === 1) {
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
              checkSelectedOptions = function checkSelectedOptions () {
                scope.selectedOptions = [];

                for (var i=0;i<scope.model.length;i++) {
                  scope.selectedOptions[scope.model[i][scope.valueField]] = true;
                }
              },

              isOptionSelected = function isOptionSelected (option) {
                return scope.selectedOptions[option[scope.valueField]];
              };

          scope.displayOptions = displayOptions;

          scope.isOptionSelected = isOptionSelected;

          var watch = scope.$watch('model', function modelWatch (newVal, oldVal) {
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

          // show close button default value
          attrs.$observe('showCloseBtn', function (showCloseBtn) {
            // if no flag set
            scope.showCloseBtn = showCloseBtn || true;
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
          scope.close = function close ($event) {
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
            var broadcastkey = 'multiSelectDropdownOpen';

            if ($dropdown.hasClass('hide')) {
              // close all other dropdowns on the page before showing the selected one
              ng.element('body').find('.multi-select-dropdown').removeClass('show').addClass('hide');
              $dropdown.removeClass('hide').addClass('show');

              if (attrs.name !== undefined) {
                broadcastkey += '_' + attrs.name;

                // dropdown open event hook
                scope.$emit(broadcastkey);
              }

              if (($dropdown.height() + $dropdown.offset().top) > $("body").height()) {
                if ($dropdown.height() > $dropdown.offset().top) {
                  $dropdown.find('ul').css('max-height', '224px');
                }
              
                $dropdown.addClass('dropdown-top');
              }
            } else {
              $dropdown
                .removeClass('show')
                .removeClass('dropdown-top')
                .addClass('hide');
            }
          };

          /**
           * Select/Deselect all options
           */
          scope.selectAll = function selectAll () {
            scope.allSelected = scope.areAllSelected();

            //clear all first
            scope.model.length = 0;

            if (scope.allSelected) {
              clearOther();
              checkSelectedOptions();
            } else {
              for (var i=0;i<scope.values.length;i++) {
                if (isOther(scope.values[i])) return;

                scope.selectOption(scope.values[i], true);
              }
            }

            scope.allSelected = !scope.allSelected;
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

            for (var i = 0; i < scope.values.length; i++) {
              if (isOther(scope.values[i])) {
                valueCount--;
              }
            }

            for (var j = 0; j < scope.model.length; j++) {
              if (isOther(scope.model[j])) {
                modelCount --;
              }
            }

            _allSelected = (modelCount === valueCount);

            // if some are selected, put checkbox in indeterminate mode
            if (!(_allSelected) && scope.model.length > 0) {
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
          var findOther = function findOther () {
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
          var _find = function _find (collection, item) {
            var selected;

            collection  = collection || [];

            for (var i=0;i<collection.length;i++) {
              selected = collection[i];

              if (item[scope.valueField] === selected[scope.valueField]) {
                return selected;
              }
            }
          };

          var findItem = function findItem (item) {
            return _find(scope.model, item);
          };

          var findInSelect = function findInSelect (item) {
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
          scope.syncOther = function syncOther (option) {
            var selected = findItem(option);

            if (selected) {
              //toggle it off
              if (! scope.shared.other) {
                selected = scope.selectOption(option, true);
              }
            } else {
              if (scope.shared.other) {
                //only select it if there is text
                selected = scope.selectOption(option, true);
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
          scope.clickCheckbox = function clickCheckbox ($event, value) {
            $event.stopPropagation();
            scope.selectOption(value);
          };

          /**
           * select/deselect option
           * @param  {Object}  option          Option object
           * @param  {Boolean} skipAllSelected Skip all selected check if unecessary
           * @return {Object}                  Item object
           */
          scope.selectOption = function selectOption (option, skipAllSelected) {
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

            if (! skipAllSelected) {
              scope.allSelected = scope.areAllSelected();
            }

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
              scope.allSelected = false;
              clearOther();
            });
          });

          // clear multi select, reference by name
          scope.$on('multiSelectClear', function (event, name) {
            if (scope.name && scope.name === name) {
              scope.model.length = 0;

              $timeout(function () {
                checkSelectedOptions();
                scope.allSelected = false;
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
