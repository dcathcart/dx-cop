import 'mocha';
import { expect } from 'chai';
import { EmailToCaseSettings } from './emailToCaseSettings';

describe('EmailToCaseSettings class', () => {
  describe('.routingAddresses() method', () => {
    it('should return an empty array when there are no routing addresses', () => {
      const emailToCaseSettings = new EmailToCaseSettings('src/test/metadata/settings/Case0.settings-meta.xml');
      const result = emailToCaseSettings.routingAddresses();
      expect(result.length).to.equal(0);
    });

    it('should return a single routing address object', () => {
      const emailToCaseSettings = new EmailToCaseSettings('src/test/metadata/settings/Case1.settings-meta.xml');
      const result = emailToCaseSettings.routingAddresses();
      expect(result.length).to.equal(1);
      expect(result[0].routingName).to.equal('Test email address');
    });

    it('should return multiple routing address objects', () => {
      const emailToCaseSettings = new EmailToCaseSettings('src/test/metadata/settings/Case.settings-meta.xml');
      const result = emailToCaseSettings.routingAddresses();
      expect(result.length).to.greaterThan(1);
    });
  });
});
