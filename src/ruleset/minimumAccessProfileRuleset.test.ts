import 'mocha';
import { expect } from 'chai';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../metadata_browser/profile';
import { MinimumAccessProfileRuleset } from './minimumAccessProfileRuleset';

describe('MinimumAccessProfileRuleset', () => {
  const profile = new Profile('MinimumAccess.profile-meta.xml');
  const ruleset = new MinimumAccessProfileRuleset(null);

  describe('.fieldPermissionWarnings()', () => {
    it('should return a warning when a field is editable', () => {
      const fieldPermission = new ProfileFieldPermission(profile, { field: 'Object1.Field1', editable: true });
      const results = ruleset['fieldPermissionWarnings'](fieldPermission);
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('MinimumAccess');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('MinimumAccess.profile-meta.xml');
      expect(results[0].problem).to.equal('<editable> permission should not be true for Object1.Field1 field');
      expect(results[0].problemType).to.equal('Warning');
    });
    it('should return a warning when a field is readable', () => {
      const fieldPermission = new ProfileFieldPermission(profile, { field: 'Object1.Field1', readable: true });
      const results = ruleset['fieldPermissionWarnings'](fieldPermission);
      expect(results.length).to.equal(1);
      expect(results[0].problem).to.equal('<readable> permission should not be true for Object1.Field1 field');
    });
    it('should not return any warnings when field permissions are all false', () => {
      const fieldPermission = new ProfileFieldPermission(profile, {
        field: 'Object1.Field1',
        editable: false,
        readable: false,
      });
      const results = ruleset['fieldPermissionWarnings'](fieldPermission);
      expect(results.length).to.equal(0);
    });

    describe('.objectPermissionWarnings()', () => {
      it('should return a warning when allowCreate is true', () => {
        const objectPermission = new ProfileObjectPermission(profile, { object: 'Object1', allowCreate: true });
        const results = ruleset['objectPermissionWarnings'](objectPermission);
        expect(results.length).to.equal(1);
        expect(results[0].componentName).to.equal('MinimumAccess');
        expect(results[0].componentType).to.equal('Profile');
        expect(results[0].fileName).to.equal('MinimumAccess.profile-meta.xml');
        expect(results[0].problem).to.equal('<allowCreate> permission should not be true for Object1 object');
        expect(results[0].problemType).to.equal('Warning');
      });
      it('should return a warning when allowDelete is true', () => {
        const objectPermission = new ProfileObjectPermission(profile, { object: 'Object1', allowDelete: true });
        const results = ruleset['objectPermissionWarnings'](objectPermission);
        expect(results.length).to.equal(1);
        expect(results[0].problem).to.equal('<allowDelete> permission should not be true for Object1 object');
      });
      it('should return a warning when allowEdit is true', () => {
        const objectPermission = new ProfileObjectPermission(profile, { object: 'Object1', allowEdit: true });
        const results = ruleset['objectPermissionWarnings'](objectPermission);
        expect(results.length).to.equal(1);
        expect(results[0].problem).to.equal('<allowEdit> permission should not be true for Object1 object');
      });
      it('should return a warning when allowRead is true', () => {
        const objectPermission = new ProfileObjectPermission(profile, { object: 'Object1', allowRead: true });
        const results = ruleset['objectPermissionWarnings'](objectPermission);
        expect(results.length).to.equal(1);
        expect(results[0].problem).to.equal('<allowRead> permission should not be true for Object1 object');
      });
      it('should return a warning when modifyAllRecords is true', () => {
        const objectPermission = new ProfileObjectPermission(profile, { object: 'Object1', modifyAllRecords: true });
        const results = ruleset['objectPermissionWarnings'](objectPermission);
        expect(results.length).to.equal(1);
        expect(results[0].problem).to.equal('<modifyAllRecords> permission should not be true for Object1 object');
      });
      it('should return a warning when viewAllRecords is true', () => {
        const objectPermission = new ProfileObjectPermission(profile, { object: 'Object1', viewAllRecords: true });
        const results = ruleset['objectPermissionWarnings'](objectPermission);
        expect(results.length).to.equal(1);
        expect(results[0].problem).to.equal('<viewAllRecords> permission should not be true for Object1 object');
      });
      it('should not return any warnings when all object permissions are false', () => {
        const objectPermission = new ProfileObjectPermission(profile, {
          field: 'Object1',
          allowCreate: false,
          allowDelete: false,
          allowEdit: false,
          allowRead: false,
          modifyAllRecords: false,
          viewAllRecords: false,
        });
        const results = ruleset['objectPermissionWarnings'](objectPermission);
        expect(results.length).to.equal(0);
      });
    });
  });
});
