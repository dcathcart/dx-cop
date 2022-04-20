import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { JsonMap } from '@salesforce/ts-types';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../../metadata_browser/Profile';

describe('Profile', () => {
  describe('.fieldPermissions()', () => {
    it('should return an array of ProfileFieldPermission objects', () => {
      const json: JsonMap = {
        fieldPermissions: [
          { editable: false, field: 'TestObject.Field1__c', readable: true },
          { editable: false, field: 'TestObject.Field2__c', readable: true },
        ],
      };
      const profile = new Profile('');
      sinon.stub(profile, 'metadata').get(() => json);

      const results = profile.fieldPermissions();
      expect(results.length).to.equal(2);
      expect(results[0].objectFieldName).to.equal('TestObject.Field1__c');
      expect(results[1].objectFieldName).to.equal('TestObject.Field2__c');
    });
  });

  describe('.objectPermissions()', () => {
    it('should return an array of ProfileObjectPermission objects', () => {
      const json: JsonMap = {
        objectPermissions: [
          { allowEdit: false, allowRead: true, object: 'TestObject1__c' },
          { allowEdit: false, allowRead: true, object: 'TestObject2__c' },
        ],
      };
      const profile = new Profile('');
      sinon.stub(profile, 'metadata').get(() => json);

      const results = profile.objectPermissions();
      expect(results.length).to.equal(2);
      expect(results[0].objectName).to.equal('TestObject1__c');
      expect(results[1].objectName).to.equal('TestObject2__c');
    });
  });
});

describe('ProfileFieldPermission', () => {
  it('should return correct values for all properties', () => {
    const fieldPerm = new ProfileFieldPermission({
      editable: false,
      field: 'TestObject.TestField__c',
      readable: true,
    });
    expect(fieldPerm.objectFieldName).to.equal('TestObject.TestField__c', 'objectFieldName');
    expect(fieldPerm.editable).to.equal(false, 'editable');
    expect(fieldPerm.readable).to.equal(true, 'readable');
  });
  it('should derive the object name from the composite object/field property', () => {
    const fieldPerm = new ProfileFieldPermission({ field: 'ObjectName.FieldName' });
    expect(fieldPerm.objectName()).to.equal('ObjectName');
  });
  it('should derive the field name from the composite object/field property', () => {
    const fieldPerm = new ProfileFieldPermission({ field: 'ObjectName.FieldName' });
    expect(fieldPerm.fieldName()).to.equal('FieldName');
  });
});

describe('ProfileObjectPermission', () => {
  it('should return correct values for all properties', () => {
    const objPerm = new ProfileObjectPermission({
      allowCreate: false,
      allowDelete: false,
      allowEdit: true,
      allowRead: true,
      modifyAllRecords: false,
      object: 'TestObject',
      viewAllRecords: true,
    });
    expect(objPerm.allowCreate).to.equal(false, 'allowCreate');
    expect(objPerm.allowDelete).to.equal(false, 'allowDelete');
    expect(objPerm.allowEdit).to.equal(true, 'allowEdit');
    expect(objPerm.allowRead).to.equal(true, 'allowRead');
    expect(objPerm.modifyAllRecords).to.equal(false, 'modifyAllRecords');
    expect(objPerm.objectName).to.equal('TestObject', 'objectName');
    expect(objPerm.viewAllRecords).to.equal(true, 'viewAllRecords');
  });
});
