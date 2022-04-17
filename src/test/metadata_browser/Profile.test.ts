import 'mocha';
import { expect } from 'chai';
import { ProfileFieldPermission, ProfileObjectPermission } from '../../metadata_browser/Profile';

describe('ProfileFieldPermission', () => {
  it('should return correct values for all properties', () => {
    const json = { editable: false, field: 'TestObject.TestField__c', readable: true };
    const result = new ProfileFieldPermission(json);
    expect(result.editable).to.equal(false, 'editable');
    expect(result.readable).to.equal(true, 'readable');
    expect(result.objectFieldName).to.equal('TestObject.TestField__c', 'objectFieldName');
    expect(result.objectName()).to.equal('TestObject', 'objectName()');
    expect(result.fieldName()).to.equal('TestField__c', 'fieldName()');
  });
});

describe('ProfileObjectPermission', () => {
  it('should return correct values for all properties', () => {
    const json = {
      allowCreate: false,
      allowDelete: false,
      allowEdit: true,
      allowRead: true,
      modifyAllRecords: false,
      object: 'TestObject',
      viewAllRecords: true,
    };
    const result = new ProfileObjectPermission(json);
    expect(result.allowCreate).to.equal(false, 'allowCreate');
    expect(result.allowDelete).to.equal(false, 'allowDelete');
    expect(result.allowEdit).to.equal(true, 'allowEdit');
    expect(result.allowRead).to.equal(true, 'allowRead');
    expect(result.modifyAllRecords).to.equal(false, 'modifyAllRecords');
    expect(result.objectName).to.equal('TestObject', 'objectName');
    expect(result.viewAllRecords).to.equal(true, 'viewAllRecords');
  });
});
