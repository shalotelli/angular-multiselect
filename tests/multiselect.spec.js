'use strict';

describe('directive: multiselect', function () {
  var element, scope;

  beforeEach(module('shalotelli-angular-multiselect'));

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();

    scope.multiSelectData = [
      { id: 1, label: 'Item #1' },
      { id: 2, label: 'Item #2' },
      { id: 3, label: 'Item #3' },
      { id: 4, label: 'Item #4' },
      { id: 5, label: 'Item #5' },
      { id: 999, label: 'Other', isOther: true }
    ];

    scope.selectedItems = [
      { id: 1, label: 'Item #1' }
    ];

    element = '<multi-select values="multiSelectData" model="selectedItems" show-filters="true" value-field="id" label-field="label"></multi-select>';

    element = $compile(element)(scope);
    scope.$digest();
  }));

  describe('when rendering the directive', function () {
    it('should contain a textarea', function () {
      expect(element.find('textarea').length).toBeDefined();
    });
  });

  describe('when given values', function () {
    it('should contain the same # of DOM li choices', function () {
      expect(element.find('.multi-select-option').length).toBe(scope.multiSelectData.length);
    });

    it('should have initial item(s) selected', function () {
      var isolated = element.isolateScope();
      expect(isolated.model.length).toBe(scope.selectedItems.length);
    });
  });

  describe('when selecting options', function () {
    beforeEach(function () {
      jasmine.clock().install();
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('should select all when All is clicked', function () {
      var isolated = element.isolateScope();
      
      element.find('.multi-select-filters span.multi-select-filter:nth(0)').click();

      jasmine.clock().tick(1);

      expect(isolated.model.length).toBe(scope.selectedItems.length);
      expect(scope.selectedItems.length).toBe(scope.multiSelectData.length);
    });

    it('should unselect all when All is clicked again', function () {
      var isolated = element.isolateScope();

      element.find('.multi-select-filters span.multi-select-filter:nth(0)').click();

      setTimeout(function () {
        element.find('.multi-select-filters span.multi-select-filter:nth(0)').click();
      }, 10);

      jasmine.clock().tick(10);

      expect(isolated.model.length).toBe(scope.selectedItems.length);
      expect(scope.selectedItems.length).toBe(0);
    })
  });
});
