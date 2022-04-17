import 'mocha';
import { expect } from 'chai';
import { CustomField } from '../../metadata_browser/CustomField';

describe('ObjectSubComponent', () => {
  describe('.objectName()', () => {
    it('should return the name of the object, derived from the file path', () => {
      // note: file doesn't need to exist for this test to pass
      const field = new CustomField('src/test/fixtures/objects/TestObject1/fields/Text__c.field-meta.xml');
      expect(field.objectName).to.equal('TestObject1');
    });
  });
});
