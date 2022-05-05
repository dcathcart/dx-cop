import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PicklistField } from '../metadata_browser/picklistField';
import { RecordType } from '../metadata_browser/recordType';
import { SfdxProjectBrowser } from '../metadata_browser/sfdxProjectBrowser';
import { RecordTypePicklistValueRuleset } from './recordTypePicklistValueRuleset';

describe('RecordTypePicklistValueRuleset', () => {
  // Regression test. Uses carefully crafted sample XML files to test the object at a high level.
  describe('.run() method', () => {
    it('should return an array of metadata problems', () => {
      const objectNames = ['TestObject2'];
      const picklistFields = [
        new PicklistField('src/test/metadata/objects/TestObject2/fields/CustomPicklist1__c.field-meta.xml'),
        new PicklistField('src/test/metadata/objects/TestObject2/fields/CustomPicklist2__c.field-meta.xml'),
        new PicklistField('src/test/metadata/objects/TestObject2/fields/GloablPicklist1.field-meta.xml'),
        new PicklistField('src/test/metadata/objects/TestObject2/fields/StandardPicklist1.field-meta.xml'),
      ];
      const recordTypes = [
        new RecordType('src/test/metadata/objects/TestObject2/recordTypes/BadExample.recordType-meta.xml'),
      ];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('objectNames').once().returns(objectNames);
      mockProjectBrowser.expects('picklistFields').once().returns(picklistFields);
      mockProjectBrowser.expects('recordTypes').once().returns(recordTypes);

      const ruleset = new RecordTypePicklistValueRuleset(sfdxProjectBrowser);
      const result = ruleset.run();
      expect(result.length).to.equal(2);
      mockProjectBrowser.verify();
    });

    it('should return an empty array when there are no problems', () => {
      const objectNames = ['TestObject2'];
      const picklistFields = [
        new PicklistField('src/test/metadata/objects/TestObject2/fields/CustomPicklist1__c.field-meta.xml'),
        new PicklistField('src/test/metadata/objects/TestObject2/fields/CustomPicklist2__c.field-meta.xml'),
        new PicklistField('src/test/metadata/objects/TestObject2/fields/GloablPicklist1.field-meta.xml'),
        new PicklistField('src/test/metadata/objects/TestObject2/fields/StandardPicklist1.field-meta.xml'),
      ];
      const recordTypes = [
        new RecordType('src/test/metadata/objects/TestObject2/recordTypes/GoodExample.recordType-meta.xml'),
      ];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('objectNames').once().returns(objectNames);
      mockProjectBrowser.expects('picklistFields').once().returns(picklistFields);
      mockProjectBrowser.expects('recordTypes').once().returns(recordTypes);

      const ruleset = new RecordTypePicklistValueRuleset(sfdxProjectBrowser);
      const result = ruleset.run();
      expect(result.length).to.equal(0);
      mockProjectBrowser.verify();
    });
  });
});
