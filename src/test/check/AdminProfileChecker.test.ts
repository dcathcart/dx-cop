import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AdminProfileChecker } from '../../check/AdminProfileChecker';
import { CustomObject } from '../../metadata_browser/CustomObject';
import { Profile, ProfileObjectPermission } from '../../metadata_browser/Profile';

describe('AdminProfileChecker', () => {
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
