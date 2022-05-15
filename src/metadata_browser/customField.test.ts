import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { JsonMap } from '@salesforce/ts-types';
import { CustomField } from './customField';

describe('CustomField', () => {
  describe('.dataType property', () => {
    it('should return the value of the <type> element', () => {
      const customField = new CustomField('');
      const json: JsonMap = { type: 'Text' };
      sinon.stub(customField, 'metadata').get(() => json);
      expect(customField.dataType).to.equal('Text');
    });
  });

  describe('.isCustom()', () => {
    it('should return true for custom objects', () => {
      const customField = new CustomField('FieldName__c');
      expect(customField.isCustom()).to.equal(true);
    });
    it('should return false for standard objects', () => {
      const customField = new CustomField('Account');
      expect(customField.isCustom()).to.equal(false);
    });
  });

  describe('.isPicklist()', () => {
    it('should return true for picklist fields', () => {
      const customField = new CustomField('');
      sinon.stub(customField, 'dataType').get(() => 'Picklist');
      expect(customField.isPicklist()).to.equal(true);
    });
    it('should return true for multi-select picklist fields', () => {
      const customField = new CustomField('');
      sinon.stub(customField, 'dataType').get(() => 'MultiselectPicklist');
      expect(customField.isPicklist()).to.equal(true);
    });
    it('should return false for other types of fields', () => {
      const customField = new CustomField('');
      // eslint-disable-next-line prettier/prettier
      sinon.stub(customField, 'dataType').onFirstCall().get(() => 'Number');
      // eslint-disable-next-line prettier/prettier
      sinon.stub(customField, 'dataType').onSecondCall().get(() => 'Text');
      expect(customField.isPicklist()).to.equal(false);
      expect(customField.isPicklist()).to.equal(false);
    });
  });

  describe('.isRequired()', () => {
    it('should return true if the field is required', () => {
      const field = new CustomField('');
      const json: JsonMap = { required: true };
      sinon.stub(field, 'metadata').get(() => json);
      expect(field.isRequired()).to.equal(true);
    });
    it('should return true if the field is a master-detail field', () => {
      const field = new CustomField('');
      const json: JsonMap = { type: 'MasterDetail' };
      sinon.stub(field, 'metadata').get(() => json);
      expect(field.isRequired()).to.equal(true);
    });
    it('should return false if the field is neither required nor master-detail', () => {
      const field = new CustomField('');
      const json: JsonMap = { required: false, type: 'Text' };
      sinon.stub(field, 'metadata').get(() => json);
      expect(field.isRequired()).to.equal(false);
    });
    it('should return false if there is no <required> element (e.g. for a standard field)', () => {
      const field = new CustomField('');
      const json: JsonMap = { nothing: 'here' };
      sinon.stub(field, 'metadata').get(() => json);
      expect(field.isRequired()).to.equal(false);
    });
  });

  describe('.objectFieldName()', () => {
    it('should return a composite value containing object name dot field name', () => {
      const customField = new CustomField('path/to/objects/ObjectName/fields/FieldName.field-meta.xml');
      expect(customField.objectFieldName()).to.equal('ObjectName.FieldName');
    });
  });
});
