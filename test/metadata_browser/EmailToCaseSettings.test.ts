import 'mocha';
import { expect } from 'chai';
import { EmailToCaseSettings } from '../../src/metadata_browser/EmailToCaseSettings';

describe('EmailToCaseSettings.routingAddresses()', () => {
  it('should return an empty array when there are no routing addresses', () => {
    const emailToCaseSettings = new EmailToCaseSettings('test/fixtures/Case0.settings-meta.xml');
    const result = emailToCaseSettings.routingAddresses();
    expect(result.length).to.equal(0);
  });

  it('should return a single routing address object', () => {
    const emailToCaseSettings = new EmailToCaseSettings('test/fixtures/Case1.settings-meta.xml');
    const result = emailToCaseSettings.routingAddresses();
    expect(result.length).to.equal(1);
    expect(result[0].routingName).to.equal('Test email address');
  });

  it('should return multiple routing address objects', () => {
    const emailToCaseSettings = new EmailToCaseSettings('test/fixtures/Case.settings-meta.xml');
    const result = emailToCaseSettings.routingAddresses();
    expect(result.length).to.greaterThan(1);
  });
});
