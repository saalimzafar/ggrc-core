/*
    Copyright (C) 2018 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {getComponentVM} from '../../../js_specs/spec_helpers';
import Component from './multi-select-label';

describe('multi-select-label component', () => {
  let vm;
  const events = Component.prototype.events;

  beforeEach(() => {
    vm = getComponentVM(Component);
  });

  describe('onlyEditMode setter', () => {
    it('sets true to editMode attribute if setted value is true', () => {
      vm.attr('editMode', false);
      vm.attr('onlyEditMode', true);

      expect(vm.attr('editMode')).toBe(true);
    });

    it('sets labelsBackup with new list of labels if value is true', () => {
      let labels = new can.List([1, 2, 3]);
      vm.attr('instance', {
        labels: labels,
      });
      vm.attr('onlyEditMode', true);

      expect(vm.attr('labelsBackup').serialize()).toEqual(labels.serialize());
      expect(vm.attr('labelsBackup')).not.toEqual(labels);
    });

    it('does not change value of editMode attribute if setted value is false',
      () => {
        vm.attr('editMode', false);
        vm.attr('onlyEditMode', false);
        expect(vm.attr('editMode')).toBe(false);

        vm.attr('editMode', true);
        vm.attr('onlyEditMode', false);
        expect(vm.attr('editMode')).toBe(true);
      });
  });

  describe('labels setter', () => {
    it('sets new can.List with setted values', () => {
      let value = new can.List([{name: '1'}, {name: '2'}, {name: '3'}]);
      let labels;

      vm.attr('labels', []);
      vm.attr('labels', value);
      labels = vm.attr('labels');

      expect(labels).not.toBe(value);

      expect(labels.serialize()).toEqual(value.serialize());
    });
  });

  describe('_labels getter', () => {
    it('returns array of labels with indexes in "_index" field', () => {
      let labels = [{name: '1'}, {name: '2'}, {name: '3'}];
      let _labels;

      vm.attr('labels', labels);
      _labels = vm.attr('_labels');

      _labels.forEach((item, index) => {
        let expectedItem = {
          name: labels[index].name,
          _index: index,
        };
        expect(item).toEqual(jasmine.objectContaining(expectedItem));
      });
    });
  });

  describe('cssClass() method', () => {
    it('returns "edit-mode" if editMode attribute is true', () => {
      vm.attr('editMode', true);
      expect(vm.cssClass()).toBe('edit-mode');
    });

    it('returns empty string if editMode attribute is false', () => {
      vm.attr('editMode', false);
      expect(vm.cssClass()).toBe('');
    });
  });

  describe('valueChanged() method', () => {
    it('sets newValue to instance.labels if it is only edit mode', () => {
      vm.attr('onlyEditMode', true);
      vm.attr('instance.labels', 'oldValue');
      vm.valueChanged('newValue');
      expect(vm.attr('instance.labels')).toEqual('newValue');
    });

    it('dispatches valueChanged event if it is not only edit mode', () => {
      spyOn(vm, 'dispatch');
      vm.attr('onlyEditMode', false);
      vm.valueChanged('newValue');

      expect(vm.dispatch).toHaveBeenCalledWith({
        type: 'valueChanged',
        value: 'newValue',
      });
    });
  });

  describe('createLabel() method', () => {
    beforeEach(() => {
      vm.attr('labels', []);
      spyOn(vm, 'valueChanged');
    });

    it('pushes new label-object into labels attribute', () => {
      let event = {newValue: 'newValue'};

      vm.createLabel(event);
      expect(vm.attr('labels').length).toBe(1);
      expect(vm.attr('labels')[0].serialize()).toEqual({
        name: event.newValue,
        id: null,
      });
    });

    it('calls valueChanged() method with labels attribute', () => {
      vm.createLabel({});
      expect(vm.valueChanged).toHaveBeenCalledWith(vm.attr('labels'));
    });
  });

  describe('labelSelected() method', () => {
    beforeEach(() => {
      spyOn(vm, 'valueChanged');
      vm.attr('labels', []);
    });

    it('pushes new label-object into labels attribute', () => {
      let label = {id: 1, name: 'label'};

      vm.labelSelected({item: label});
      expect(vm.attr('labels').length).toBe(1);
      expect(vm.attr('labels')[0].serialize()).toEqual({
        id: label.id,
        name: label.name,
        type: 'Label',
      });
    });

    it('calls valueChanged() method with labels attribute', () => {
      vm.labelSelected({item: {}});
      expect(vm.valueChanged).toHaveBeenCalledWith(vm.attr('labels'));
    });
  });

  describe('removeLabel() method', () => {
    let labels;

    beforeEach(() => {
      labels = [1, 2, 3];
      spyOn(vm, 'valueChanged');
    });

    it('removes label with specified index from labels attrribute', () => {
      let expectedResult;

      labels.forEach((label, index) => {
        expectedResult = labels.slice();
        expectedResult.splice(index, 1);

        vm.attr('labels', labels);
        vm.removeLabel(index);

        expect(vm.attr('labels').serialize()).toEqual(expectedResult);
      });
    });

    it('calls valueChanged() method with labels attribute', () => {
      vm.attr('labels', labels);
      vm.removeLabel(1);
      expect(vm.valueChanged).toHaveBeenCalledWith(vm.attr('labels'));
    });
  });

  describe('events', () => {
    let handler;

    describe('"{viewModel.instance} modal:discard" handler', () => {
      beforeEach(() => {
        spyOn(vm, 'valueChanged');
        handler = events['{viewModel.instance} modal:discard'].bind({
          viewModel: vm,
        });
      });

      it('calls valueChanged() method with labelsBackup attribute ' +
      'if it is only edit mode', () => {
        vm.attr('labelsBackup', [1, 2, 3]);
        vm.attr('onlyEditMode', true);
        handler();

        expect(vm.valueChanged).toHaveBeenCalledWith(vm.attr('labelsBackup'));
      });

      it('does not call valueChanged() method ' +
      'if it is not only edit mode', () => {
        vm.attr('onlyEditMode', false);
        handler();

        expect(vm.valueChanged).not.toHaveBeenCalled();
      });
    });
  });
});
