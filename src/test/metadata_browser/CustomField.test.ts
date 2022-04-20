import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { JsonMap } from '@salesforce/ts-types';
import { CustomField } from '../../metadata_browser/CustomField';

describe('CustomField', () => {
  it('should return the correct values for all properties', () => {
    const json: JsonMap = { required: true, type: 'Text' };
    const customField = new CustomField('');
    sinon.stub(customField, 'metadata').get(() => json);

    expect(customField.dataType).to.equal('Text');
    expect(customField.required).to.equal(true);
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

  describe('.isMasterDetail()', () => {
    it('should return true for Master-Detail fields', () => {
      const customField = new CustomField('');
      sinon.stub(customField, 'dataType').get(() => 'MasterDetail');
      expect(customField.isMasterDetail()).to.equal(true);
    });
    it('should return false for other types of fields', () => {
      const customField = new CustomField('');
      // eslint-disable-next-line prettier/prettier
      sinon.stub(customField, 'dataType').onFirstCall().get(() => 'Number').onSecondCall().get(() => 'Picklist');
      expect(customField.isMasterDetail()).to.equal(false);
      expect(customField.isMasterDetail()).to.equal(false);
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
      sinon.stub(customField, 'dataType').onFirstCall().get(() => 'Number').onSecondCall().get(() => 'Text');
      expect(customField.isMasterDetail()).to.equal(false);
      expect(customField.isMasterDetail()).to.equal(false);
    });
  });

  describe('.objectFieldName()', () => {
    it('should return a composite value containing object name dot field name', () => {
      const customField = new CustomField('path/to/objects/ObjectName/fields/FieldName.field-meta.xml');
      expect(customField.objectFieldName()).to.equal('ObjectName.FieldName');
    });
  });
});
