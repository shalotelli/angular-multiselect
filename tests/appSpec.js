describe('directive: shalotelli-angular-multiselect', function() {
  var element, scope;

  beforeEach(module('shalotelli-angular-multiselect'));

	beforeEach(module('templates'));

  beforeEach(inject(function($rootScope, $compile) {

    scope = $rootScope.$new();

		scope.multiSelectData = [
			{ id: 1, label: 'Option 1' },
			{ id: 2, label: 'Option 2'},
			{ id: 3, label: 'Option 3' },
			{ id: 999, label: 'Other', isOther: true}
		];

		scope.selectedItems = [
			{ id: 1, label: 'Option 1' }
		];


    element = '<multi-select template-path="views/directives/multi-select.html" values="multiSelectData" model="selectedItems" show-filters="true" other-field="isOther" other-ng-model="other" show-other="true"  value-field="id" label-field="label"></multi-select>';

    element = $compile(element)(scope);
    scope.$digest();

  }));

	describe('when rendering the directive', function() {

		it("should contain a textarea", function() {

			expect(element.find('textarea').length).toBeTruthy();

		});

	});

  describe('with given values', function() {

	  it("should contain same # of DOM li choices", function() {

	    expect(element.find('ul .multi-select-option').length).toBe(scope.multiSelectData.length);

		});

		it("should have initial option(s) selected", function () {

			var isolated = element.isolateScope();
      expect(isolated.model.length).toBe(scope.selectedItems.length);

		});

  });

	describe('when selecting options', function() {

		beforeEach(function() {
			jasmine.Clock.useMock();
		});

		it("should select all when All is clicked", function() {

			element.find('textarea').focus();

			setTimeout(function() {

				element.find('.multi-select-filters span.multi-select-filter:nth(0)').click();

			}, 0);


	    jasmine.Clock.tick(1);

			var isolated = element.isolateScope();
			expect(isolated.model.length).toBe(scope.selectedItems.length);

	    expect(scope.selectedItems.length).toBe(scope.multiSelectData.length - 1);

		});

	});

});
