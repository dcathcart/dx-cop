import 'mocha';
import { expect } from 'chai';
import { Profile, ProfileFieldPermission } from '../metadata_browser/profile';
import { MinimumAccessProfileRuleset } from './minimumAccessProfileRuleset';

describe('MinimumAccessProfileRuleset', () => {
  describe('.fieldPermissionWarnings()', () => {
    it('returns a warning when a field is editable', () => {
      const profile = new Profile('MinimumAccess.profile-meta.xml');
      const fieldPermission = new ProfileFieldPermission(profile, { field: 'Object1.Field1', editable: true });
      const ruleset = new MinimumAccessProfileRuleset(null);
      const results = ruleset['fieldPermissionWarnings'](fieldPermission);
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('MinimumAccess');
      expect(results[0].componentType).to.equal('Profile');
      expect(results[0].fileName).to.equal('MinimumAccess.profile-meta.xml');
      expect(results[0].problem).to.equal('<editable> permission should not be true for Object1.Field1 field');
      expect(results[0].problemType).to.equal('Warning');
    });
  });
});
