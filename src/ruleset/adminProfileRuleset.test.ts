import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CustomField } from '../metadata_browser/customField';
import { CustomObject } from '../metadata_browser/customObject';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../metadata_browser/profile';
import { AdminProfileRuleset } from './adminProfileRuleset';

describe('AdminProfileRuleset', () => {
  describe('.filterObjects()', () => {
    it('keeps custom objects', () => {
      const customObject = new CustomObject('Object1__c.object-meta.xml');
      sinon.stub(customObject, 'isCustomObject').returns(true);

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['filterObjects']([customObject]);
      expect(results.length).to.equal(1);
      expect(results[0]).to.equal(customObject);
    });

    it('filters out standard objects', () => {
      const standardObject = new CustomObject('Account.object-meta.xml');
      sinon.stub(standardObject, 'isCustomObject').returns(false);

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['filterObjects']([standardObject]);
      expect(results.length).to.equal(0);
    });
  });

  describe('.filterFields()', () => {
    it('filters out standard fields', () => {
      const standardField = new CustomField('Name.field-meta.xml');
      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['filterFields']([standardField]);
      expect(results.length).to.equal(0);
    });

    it('filters out custom, required fields', () => {
      const customField = new CustomField('Status__c.field-meta.xml');
      sinon.stub(customField, 'isRequired').returns(true);

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['filterFields']([customField]);
      expect(results.length).to.equal(0);
    });

    it('keeps custom, non-required fields', () => {
      const customField = new CustomField('Status__c.field-meta.xml');
      sinon.stub(customField, 'isRequired').returns(false);

      const ruleset = new AdminProfileRuleset(null);
      const results = ruleset['filterFields']([customField]);
      expect(results.length).to.equal(1);
      expect(results[0]).to.equal(customField);
    });
  });

  describe('.missingFields()', () => {
    it("should return a list of warnings for fields that are expected to exist in the profile, but don't", () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const fieldPermissions = [
        new ProfileFieldPermission(profile, { field: 'Object1.Field1' }),
        new ProfileFieldPermission(profile, { field: 'Object1.Field2' }),
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

  describe('.fieldPermissionWarnings()', () => {
    context('when the field is one of the "fields to check"', () => {
      it('should return a warning when <editable> is false', () => {
        const profile = new Profile('Admin.profile-meta.xml');
        const field = new CustomField('objects/Object1/fields/Field1__c.field-meta.xml');
        sinon.stub(field, 'isFormula').returns(false);

        const fieldPermissions = [
          new ProfileFieldPermission(profile, { editable: false, field: 'Object1.Field1__c', readable: true }),
        ];
        sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

        const ruleset = new AdminProfileRuleset(null);
        const results = ruleset['fieldPermissionWarnings'](profile, [field]);
        expect(results.length).to.equal(1);
        expect(results[0].componentName).to.equal('Admin');
        expect(results[0].componentType).to.equal('Profile');
        expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
        expect(results[0].problem).to.equal('<editable> permission not set for field Object1.Field1__c');
        expect(results[0].problemType).to.equal('Warning');
      });
      it('should not return a warning when <editable> is false, but the field is a formula field', () => {
        const profile = new Profile('Admin.profile-meta.xml');
        const field = new CustomField('objects/Object1/fields/Field1__c.field-meta.xml');
        sinon.stub(field, 'isFormula').returns(true);

        const fieldPermissions = [
          new ProfileFieldPermission(profile, { editable: false, field: 'Object1.Field1__c', readable: true }),
        ];
        sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

        const ruleset = new AdminProfileRuleset(null);
        const results = ruleset['fieldPermissionWarnings'](profile, [field]);
        expect(results.length).to.equal(0);
      });
      it('should return a warning when <readable> is false', () => {
        const profile = new Profile('Admin.profile-meta.xml');
        const field = new CustomField('objects/Object1/fields/Field1.field-meta.xml');
        sinon.stub(field, 'isFormula').returns(false);

        const fieldPermissions = [
          new ProfileFieldPermission(profile, { editable: true, field: 'Object1.Field1', readable: false }),
        ];
        sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

        const ruleset = new AdminProfileRuleset(null);
        const results = ruleset['fieldPermissionWarnings'](profile, [field]);
        expect(results.length).to.equal(1);
        expect(results[0].componentName).to.equal('Admin');
        expect(results[0].componentType).to.equal('Profile');
        expect(results[0].fileName).to.equal('Admin.profile-meta.xml');
        expect(results[0].problem).to.equal('<readable> permission not set for field Object1.Field1');
        expect(results[0].problemType).to.equal('Warning');
      });
      it('should not return a warning when <editable> and <readable> are true', () => {
        const profile = new Profile('Admin.profile-meta.xml');
        const fieldsToCheck = [new CustomField('objects/Object1/fields/Field1.field-meta.xml')];
        const fieldPermissions = [
          new ProfileFieldPermission(profile, { editable: true, field: 'Object1.Field1', readable: true }),
        ];
        sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

        const ruleset = new AdminProfileRuleset(null);
        const results = ruleset['fieldPermissionWarnings'](profile, fieldsToCheck);
        expect(results.length).to.equal(0);
      });
    });
    context('when the field is *not* one of the "fields to check"', () => {
      it('should not check the field and should not return a warning', () => {
        const profile = new Profile('Admin.profile-meta.xml');
        const fieldsToCheck = [];
        // No editable or readable property here on purpose
        // If the method's code tries to access either of these properties an error will occur
        const fieldPermissions = [new ProfileFieldPermission(profile, { field: 'Object1.Field1' })];
        sinon.stub(profile, 'fieldPermissions').returns(fieldPermissions);

        const ruleset = new AdminProfileRuleset(null);
        const results = ruleset['fieldPermissionWarnings'](profile, fieldsToCheck);
        expect(results.length).to.equal(0);
      });
    });
  });

  describe('.fieldSortOrderWarnings()', () => {
    it("should return a list of warnings for field permissions that aren't sorted by object/field name", () => {
      const profile = new Profile('Admin.profile-meta.xml');
      const fieldPermissions = [
        new ProfileFieldPermission(profile, { field: 'Object1.Field2' }),
        new ProfileFieldPermission(profile, { field: 'Object1.Field3' }),
        new ProfileFieldPermission(profile, { field: 'Object1.Field1' }),
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
      const objectPermissions = [new ProfileObjectPermission(profile, { object: 'Object1' })];
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
        new ProfileObjectPermission(profile, {
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
        new ProfileObjectPermission(profile, { object: 'Object1' }),
        new ProfileObjectPermission(profile, { object: 'Object5' }),
        new ProfileObjectPermission(profile, { object: 'Object4' }),
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
