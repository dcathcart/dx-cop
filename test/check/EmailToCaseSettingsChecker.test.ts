import 'mocha';
import { expect } from 'chai';
import { EmailToCaseSettings } from '../../src/metadata_browser/EmailToCaseSettings';
import { EmailToCaseSettingsChecker } from '../../src/check/EmailToCaseSettingsChecker';

describe('EmailToCaseSettingsChecker', () => {
  describe('.checkEmailServicesAddress() method', () => {
    it('should return a metadata error when an <emailServicesAddress> field exists', () => {
      const fileName = 'test/fixtures/Case-errors.settings-meta.xml';
      const emailToCaseSettings = new EmailToCaseSettings(fileName);
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['checkEmailServicesAddress'](emailToCaseSettings);
      expect(result.length).to.equal(1);
      expect(result[0].componentType).to.equal('CaseSettings');
      expect(result[0].componentName).to.equal('EmailToCase:Test email address');
      expect(result[0].fileName).to.equal(fileName);
      expect(result[0].problem).to.equal('<emailServicesAddress> field should not be version-controlled');
      expect(result[0].problemType).to.equal('Error');
    });

    it('should return an empty array when there are no errors', () => {
      const emailToCaseSettings = new EmailToCaseSettings('test/fixtures/Case.settings-meta.xml');
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['checkEmailServicesAddress'](emailToCaseSettings);
      expect(result.length).to.equal(0);
    });
  });

  describe('.checkIsVerified() method', () => {
    it('should return a metadata error when an <isVerified> field exists', () => {
      const fileName = 'test/fixtures/Case-errors.settings-meta.xml';
      const emailToCaseSettings = new EmailToCaseSettings(fileName);
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['checkIsVerified'](emailToCaseSettings);
      expect(result.length).to.equal(1);
      expect(result[0].componentType).to.equal('CaseSettings');
      expect(result[0].componentName).to.equal('EmailToCase:Test email address');
      expect(result[0].fileName).to.equal(fileName);
      expect(result[0].problem).to.equal('<isVerified> field should not be version-controlled');
      expect(result[0].problemType).to.equal('Error');
    });

    it('should return an empty array when there are no errors', () => {
      const emailToCaseSettings = new EmailToCaseSettings('test/fixtures/Case.settings-meta.xml');
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['checkIsVerified'](emailToCaseSettings);
      expect(result.length).to.equal(0);
    });
  });

  describe('.checkSortOrder() method', () => {
    it("should return a metadata error when <routingAddresses> aren't sorted by <routingName>", () => {
      const fileName = 'test/fixtures/Case-errors.settings-meta.xml';
      const emailToCaseSettings = new EmailToCaseSettings(fileName);
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['checkSortOrder'](emailToCaseSettings);
      expect(result.length).to.equal(1);
      expect(result[0].componentType).to.equal('CaseSettings');
      expect(result[0].componentName).to.equal('EmailToCase');
      expect(result[0].fileName).to.equal(fileName);
      expect(result[0].problem).to.equal(
        "<routingAddresses> should be sorted by <routingName>. Expect 'Test email address 2' to be before 'Test email address 3'"
      );
      expect(result[0].problemType).to.equal('Warning');
    });

    it('should return an empty array when there are no errors', () => {
      const emailToCaseSettings = new EmailToCaseSettings('test/fixtures/Case.settings-meta.xml');
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['checkSortOrder'](emailToCaseSettings);
      expect(result.length).to.equal(0);
    });
  });
});
