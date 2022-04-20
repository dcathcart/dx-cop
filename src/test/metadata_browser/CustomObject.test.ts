import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { JsonMap } from '@salesforce/ts-types';
import { CustomObject } from '../../metadata_browser/CustomObject';

describe('CustomObject', () => {
  describe('.isCustomObject()', () => {
    it('should return true for custom objects', () => {
      const customObject = new CustomObject('ObjectName__c');
      sinon.stub(customObject, 'isCustomSetting').returns(false);
      expect(customObject.isCustomObject()).to.equal(true);
    });
    it('should return false for custom settings', () => {
      const customSetting = new CustomObject('CustomSettingsName__c');
      const json: JsonMap = { customSettingsType: 'Hierarchy' };
      sinon.stub(customSetting, 'metadata').get(() => json);
      expect(customSetting.isCustomObject()).to.equal(false);
    });
    it('should return false for standard objects', () => {
      const standardObject = new CustomObject('Account');
      expect(standardObject.isCustomObject()).to.equal(false);
    });
  });
});
