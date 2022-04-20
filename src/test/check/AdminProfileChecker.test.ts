import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AdminProfileChecker } from '../../check/AdminProfileChecker';
import { CustomField } from '../../metadata_browser/CustomField';
import { CustomObject } from '../../metadata_browser/CustomObject';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../../metadata_browser/Profile';
import { SfdxProjectBrowser } from '../../metadata_browser/SfdxProjectBrowser';

describe('AdminProfileChecker', () => {
  describe('.expectedObjects()', () => {
    it('should only check custom objects', () => {
      // Bit of setup here: Create a mock project with 2 objects: a custom and a standard object.
      // We want to demonstrate that only the custom object is selected.
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);

      const customObject = new CustomObject('Object1__c.object-meta.xml');
      sinon.stub(customObject, 'isCustomObject').returns(true);
      const standardObject = new CustomObject('Object2.object-meta.xml');
      sinon.stub(standardObject, 'isCustomObject').returns(false);

      const objects = [customObject, standardObject];
      mockProjectBrowser.expects('objects').once().returns(objects);

      const checker = new AdminProfileChecker(sfdxProjectBrowser);
      const results = checker['expectedObjects']();
      expect(results.length).to.equal(1);
      expect(results[0].name).to.equal('Object1__c');

      mockProjectBrowser.verify();
    });
  });

  describe('.expectedFields()', () => {
    it('should only check custom fields that are not required and not Master-Detail fields', () => {
      // blergh. Need to break this down into several different tests
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);

      const object1 = new CustomObject('Object1__c.object-meta.xml');
      const object2 = new CustomObject('Object2__c.object-meta.xml');
      const objects = [object1, object2];

      const standardField = new CustomField('path/to/objects/Object1__c/fields/Field1.field-meta.xml');
      sinon.stub(standardField, 'isCustom').returns(false);
      const customField = new CustomField('path/to/objects/Object1__c/fields/Field2__c.fields-meta.xml');
      sinon.stub(customField, 'isCustom').returns(true);
      sinon.stub(customField, 'required').get(() => false);
      sinon.stub(customField, 'isMasterDetail').returns(false);
      const object1Fields = [standardField, customField];

      const requiredField = new CustomField('path/to/objects/Object2__c/fields/Field3__c.fields-meta.xml');
      sinon.stub(requiredField, 'isCustom').returns(true);
      sinon.stub(requiredField, 'required').get(() => true);
      const masterDetailField = new CustomField('path/to/objects/Object2__c/fields/Field4__c.fields-meta.xml');
      sinon.stub(masterDetailField, 'isCustom').returns(true);
      sinon.stub(masterDetailField, 'required').get(() => false);
      sinon.stub(masterDetailField, 'isMasterDetail').returns(true);
      const object2Fields = [requiredField, masterDetailField];

      mockProjectBrowser.expects('fields').once().withArgs('Object1__c').returns(object1Fields);
      mockProjectBrowser.expects('fields').once().withArgs('Object2__c').returns(object2Fields);

      const checker = new AdminProfileChecker(sfdxProjectBrowser);
      const results = checker['expectedFields'](objects);
      // after all that, only expect to see the custom field that is not required & not master-detail
      expect(results.length).to.equal(1);
      expect(results[0]).to.equal(customField);
      mockProjectBrowser.verify();
    });
  });

  describe('.missingFields()', () => {
    it("should return a list of warnings for fields that are expected to exist in the profile, but don't", () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const fieldPermissions = [
        new ProfileFieldPermission({ field: 'Object1.Field1' }),
        new ProfileFieldPermission({ field: 'Object1.Field2' }),
      ];
      sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

      const expectedFields = [
        new CustomField('path/to/objects/Object1/fields/Field1.field-meta.xml'),
        new CustomField('path/to/objects/Object1/fields/Field2.field-meta.xml'),
        new CustomField('path/to/objects/Object1/fields/Field3.field-meta.xml'),
      ];

      const checker = new AdminProfileChecker(null);
      const results = checker['missingFields'](profile, expectedFields);
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('Admin');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
      expect(results[0].problem).to.equal('<fieldPermissions> not found for Object1.Field3');
      expect(results[0].problemType).to.equal('Warning');
    });
  });

  describe('.missingFieldPermissions()', () => {
    it('should return a list of warnings for field permissions that are false, but should be true', () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const fieldPermissions = [
        new ProfileFieldPermission({ editable: false, field: 'Object1.Field1', readable: false }),
      ];
      sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

      const checker = new AdminProfileChecker(null);
      const results = checker['missingFieldPermissions'](profile);
      expect(results.length).to.equal(2);

      expect(results[0].componentName).to.equal('Admin');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
      expect(results[0].problem).to.equal('<editable> permission not set for field Object1.Field1');
      expect(results[0].problemType).to.equal('Warning');

      expect(results[1].problem).to.equal('<readable> permission not set for field Object1.Field1');
    });
  });

  describe('.fieldSortOrderWarnings()', () => {
    it("should return a list of warnings for field permissions that aren't sorted by object/field name", () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const fieldPermissions = [
        new ProfileFieldPermission({ field: 'Object1.Field2' }),
        new ProfileFieldPermission({ field: 'Object1.Field3' }),
        new ProfileFieldPermission({ field: 'Object1.Field1' }),
      ];
      sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

      const checker = new AdminProfileChecker(null);
      const results = checker['fieldSortOrderWarnings'](profile);
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('Admin');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
      expect(results[0].problem).to.equal(
        '<fieldPermissions> should be sorted by <field>. Expect Object1.Field1 to be before Object1.Field3'
      ); // Yes this is correct. It's not quite smart enought to tell you that Field1 should actually be before Field2
      expect(results[0].problemType).to.equal('Warning');
    });
  });
  describe('.missingObjects()', () => {
    it("should return a list of warnings for objects that are expected to exist in the profile, but don't", () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const objectPermissions = [new ProfileObjectPermission({ object: 'Object1' })];
      sinon.stub(profile, 'objectPermissions').returns(objectPermissions);

      const expectedObjects = [
        new CustomObject('Object1.object-meta.xml'),
        new CustomObject('Object2.object-meta.xml'),
      ];

      const checker = new AdminProfileChecker(null);
      const results = checker['missingObjects'](profile, expectedObjects);
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('Admin');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
      expect(results[0].problem).to.equal('<objectPermissions> not found for Object2');
      expect(results[0].problemType).to.equal('Warning');
    });
  });

  describe('.missingObjectPermissions()', () => {
    it('should return a list of warnings for object permissions that are false, but should be true', () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const objectPermissions = [
        new ProfileObjectPermission({
          allowCreate: false,
          allowDelete: false,
          allowEdit: false,
          allowRead: false,
          modifyAllRecords: false,
          object: 'Object1',
          viewAllRecords: false,
        }),
      ];
      sinon.stub(profile, 'objectPermissions').returns(objectPermissions);

      const checker = new AdminProfileChecker(null);
      const results = checker['missingObjectPermissions'](profile);
      expect(results.length).to.equal(6);

      expect(results[0].componentName).to.equal('Admin');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
      expect(results[0].problem).to.equal('<allowCreate> permission not set for object Object1');
      expect(results[0].problemType).to.equal('Warning');

      expect(results[1].problem).to.equal('<allowDelete> permission not set for object Object1');
      expect(results[2].problem).to.equal('<allowEdit> permission not set for object Object1');
      expect(results[3].problem).to.equal('<allowRead> permission not set for object Object1');
      expect(results[4].problem).to.equal('<modifyAllRecords> permission not set for object Object1');
      expect(results[5].problem).to.equal('<viewAllRecords> permission not set for object Object1');
    });
  });

  describe('.objectSortOrderWarnings()', () => {
    it("should return a list of warnings for object permissions that aren't sorted by object", () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const objectPermissions = [
        new ProfileObjectPermission({ object: 'Object1' }),
        new ProfileObjectPermission({ object: 'Object5' }),
        new ProfileObjectPermission({ object: 'Object4' }),
      ];
      sinon.stub(profile, 'objectPermissions').returns(objectPermissions);

      const checker = new AdminProfileChecker(null);
      const results = checker['objectSortOrderWarnings'](profile);
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('Admin');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
      expect(results[0].problem).to.equal(
        '<objectPermissions> should be sorted by <object>. Expect Object4 to be before Object5'
      );
      expect(results[0].problemType).to.equal('Warning');
    });
  });
});
