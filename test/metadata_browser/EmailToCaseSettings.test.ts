import { expect } from 'chai';
import { EmailToCaseSettings } from '../../src/metadata_browser/EmailToCaseSettings';
import 'mocha';

describe('routingAddresses() function', () => {
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
    const emailToCaseSettings = new EmailToCaseSettings('test/fixtures/Case2.settings-meta.xml');
    const result = emailToCaseSettings.routingAddresses();
    expect(result.length).to.equal(2);
  });
});
