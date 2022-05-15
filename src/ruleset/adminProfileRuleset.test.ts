import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CustomField } from '../metadata_browser/customField';
import { CustomObject } from '../metadata_browser/customObject';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../metadata_browser/profile';
import { SfdxProjectBrowser } from '../metadata_browser/sfdxProjectBrowser';
import { AdminProfileRuleset } from './adminProfileRuleset';

describe('AdminProfileRuleset', () => {
  describe('.expectedObjects()', () => {
    it('should only check custom objects', () => {
      // Bit of setup here: Create a mock project with 2 objects: a custom and a standard object.
      // We want to demonstrate that only the custom object is selected.
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);

      const standardObject = new CustomObject('Object1.object-meta.xml');
      sinon.stub(standardObject, 'isCustomObject').returns(false);
      const customObject = new CustomObject('Object2__c.object-meta.xml');
      sinon.stub(customObject, 'isCustomObject').returns(true);

      const objects = [standardObject, customObject];
      mockProjectBrowser.expects('objects').once().returns(objects);

      const ruleset = new AdminProfileRuleset(sfdxProjectBrowser);
      const results = ruleset['expectedObjects']();
      expect(results.length).to.equal(1);
      expect(results[0].name).to.equal('Object2__c');

      mockProjectBrowser.verify();
    });
  });

  describe('.expectedFields()', () => {
    it('retrieves fields for each of the given objects', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);

      const standardObject = new CustomObject('Object1.object-meta.xml');
      const customObject = new CustomObject('Object2__c.object-meta.xml');
      const objects = [standardObject, customObject];

      mockProjectBrowser.expects('fields').once().withArgs('Object1').returns([]);
      mockProjectBrowser.expects('fields').once().withArgs('Object2__c').returns([]);
      const ruleset = new AdminProfileRuleset(sfdxProjectBrowser);
      ruleset['expectedFields'](objects);
      mockProjectBrowser.verify();
    });
    it('only checks custom fields that are not required', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      const objects = [new CustomObject('Object1.object-meta.xml')];

      // required field - not expected in results
      const field1 = new CustomField('path/to/objects/Object1/fields/Field1__c.field-meta.xml');
      sinon.stub(field1, 'isRequired').returns(true);

      // NON-required field, IS expected in results
      const field2 = new CustomField('path/to/objects/Object1/fields/Field2__c.field-meta.xml');
      sinon.stub(field2, 'isRequired').returns(false);

      mockProjectBrowser.expects('fields').once().withArgs('Object1').returns([field1, field2]);
      const ruleset = new AdminProfileRuleset(sfdxProjectBrowser);
      const results = ruleset['expectedFields'](objects);
      expect(results.length).to.equal(1);
      expect(results[0]).to.equal(field2);
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

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['missingFields'](profile, expectedFields);
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

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['missingFieldPermissions'](profile);
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

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['fieldSortOrderWarnings'](profile);
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

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['missingObjects'](profile, expectedObjects);
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

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['missingObjectPermissions'](profile);
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

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['objectSortOrderWarnings'](profile);
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
