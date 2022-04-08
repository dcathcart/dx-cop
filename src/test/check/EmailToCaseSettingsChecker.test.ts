import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { EmailToCaseSettings } from '../../metadata_browser/EmailToCaseSettings';
import { EmailToCaseSettingsChecker } from '../../check/EmailToCaseSettingsChecker';
import { SfdxProjectBrowser } from '../../metadata_browser/SfdxProjectBrowser';

describe('EmailToCaseSettingsChecker', () => {
  // Regression test. Uses carefully crafted sample XML files to test the object at a high level.
  describe('.run()', () => {
    it('should return an array of metadata problems', () => {
      const emailToCaseSettings = new EmailToCaseSettings('src/test/fixtures/settings/Case-errors.settings-meta.xml');
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('emailToCaseSettings').once().returns(emailToCaseSettings);

      const checker = new EmailToCaseSettingsChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(3);
      mockProjectBrowser.verify();
    });

    it('should return an empty array when there are no problems', () => {
      const emailToCaseSettings = new EmailToCaseSettings('src/test/fixtures/settings/Case.settings-meta.xml');
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('emailToCaseSettings').once().returns(emailToCaseSettings);

      const checker = new EmailToCaseSettingsChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(0);
      mockProjectBrowser.verify();
    });
  });

  describe('.emailServicesAddressErrors()', () => {
    it('should return a metadata error when an <emailServicesAddress> field exists', () => {
      const fileName = 'src/test/fixtures/settings/Case-errors.settings-meta.xml';
      const emailToCaseSettings = new EmailToCaseSettings(fileName);
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['emailServicesAddressErrors'](emailToCaseSettings);
      expect(result.length).to.equal(1);
      expect(result[0].componentType).to.equal('CaseSettings');
      expect(result[0].componentName).to.equal('EmailToCase:Test email address');
      expect(result[0].fileName).to.equal(fileName);
      expect(result[0].problem).to.equal('<emailServicesAddress> field should not be version-controlled');
      expect(result[0].problemType).to.equal('Error');
    });

    it('should return an empty array when there are no errors', () => {
      const emailToCaseSettings = new EmailToCaseSettings('src/test/fixtures/settings/Case.settings-meta.xml');
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['emailServicesAddressErrors'](emailToCaseSettings);
      expect(result.length).to.equal(0);
    });
  });

  describe('.isVerifiedErrors()', () => {
    it('should return a metadata error when an <isVerified> field exists', () => {
      const fileName = 'src/test/fixtures/settings/Case-errors.settings-meta.xml';
      const emailToCaseSettings = new EmailToCaseSettings(fileName);
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['isVerifiedErrors'](emailToCaseSettings);
      expect(result.length).to.equal(1);
      expect(result[0].componentType).to.equal('CaseSettings');
      expect(result[0].componentName).to.equal('EmailToCase:Test email address');
      expect(result[0].fileName).to.equal(fileName);
      expect(result[0].problem).to.equal('<isVerified> field should not be version-controlled');
      expect(result[0].problemType).to.equal('Error');
    });

    it('should return an empty array when there are no errors', () => {
      const emailToCaseSettings = new EmailToCaseSettings('src/test/fixtures/settings/Case.settings-meta.xml');
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['isVerifiedErrors'](emailToCaseSettings);
      expect(result.length).to.equal(0);
    });
  });

  describe('.sortOrderWarnings()', () => {
    it("should return a metadata error when <routingAddresses> aren't sorted by <routingName>", () => {
      const fileName = 'src/test/fixtures/settings/Case-errors.settings-meta.xml';
      const emailToCaseSettings = new EmailToCaseSettings(fileName);
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['sortOrderWarnings'](emailToCaseSettings);
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
      const emailToCaseSettings = new EmailToCaseSettings('src/test/fixtures/settings/Case.settings-meta.xml');
      const checker = new EmailToCaseSettingsChecker(null);
      const result = checker['sortOrderWarnings'](emailToCaseSettings);
      expect(result.length).to.equal(0);
    });
  });
});
