import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PicklistField } from '../../src/metadata_browser/PicklistField';
import { RecordType } from '../../src/metadata_browser/RecordType';
import { RecordTypePicklistValueChecker } from '../../src/check/RecordTypePicklistValueChecker';
import { SfdxProjectBrowser } from '../../src/metadata_browser/SfdxProjectBrowser';

describe('RecordTypePicklistValueChecker', () => {
  // this one is less unit test, more functional test
  // uses carefully crafted sample XML files to test the object at a high level
  describe('.run() method', () => {
    it('should return an array of metadata problems', () => {
      const objectNames = ['TestObject2'];
      const picklistFields = [
        new PicklistField('test/fixtures/objects/TestObject2/fields/CustomPicklist1__c.field-meta.xml'),
        new PicklistField('test/fixtures/objects/TestObject2/fields/CustomPicklist2__c.field-meta.xml'),
        new PicklistField('test/fixtures/objects/TestObject2/fields/GloablPicklist1.field-meta.xml'),
        new PicklistField('test/fixtures/objects/TestObject2/fields/StandardPicklist1.field-meta.xml'),
      ];
      const recordTypes = [
        new RecordType('test/fixtures/objects/TestObject2/recordTypes/BadExample.recordType-meta.xml'),
      ];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('objectNames').once().returns(objectNames);
      mockProjectBrowser.expects('picklistFields').once().returns(picklistFields);
      mockProjectBrowser.expects('recordTypes').once().returns(recordTypes);

      const checker = new RecordTypePicklistValueChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(2);
      mockProjectBrowser.verify();
    });

    it('should return an empty array when there are no problems', () => {
      const objectNames = ['TestObject2'];
      const picklistFields = [
        new PicklistField('test/fixtures/objects/TestObject2/fields/CustomPicklist1__c.field-meta.xml'),
        new PicklistField('test/fixtures/objects/TestObject2/fields/CustomPicklist2__c.field-meta.xml'),
        new PicklistField('test/fixtures/objects/TestObject2/fields/GloablPicklist1.field-meta.xml'),
        new PicklistField('test/fixtures/objects/TestObject2/fields/StandardPicklist1.field-meta.xml'),
      ];
      const recordTypes = [
        new RecordType('test/fixtures/objects/TestObject2/recordTypes/GoodExample.recordType-meta.xml'),
      ];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('objectNames').once().returns(objectNames);
      mockProjectBrowser.expects('picklistFields').once().returns(picklistFields);
      mockProjectBrowser.expects('recordTypes').once().returns(recordTypes);

      const checker = new RecordTypePicklistValueChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(0);
      mockProjectBrowser.verify();
    });
  });
});