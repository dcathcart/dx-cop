import 'mocha';
import { expect } from 'chai';
import { CustomField } from '../../src/metadata_browser/CustomField';

describe('ObjectSubComponent', () => {
  describe('.objectName()', () => {
    it('should return the name of the object, derived from the file path', () => {
      const field = new CustomField('test/fixtures/objects/TestObject/fields/Text__c.field-meta.xml');
      expect(field.objectName).to.equal('TestObject');
    });
  });
});
