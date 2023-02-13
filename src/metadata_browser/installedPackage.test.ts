import 'mocha';
import { expect } from 'chai';
import { InstalledPackage } from './installedPackage';

describe('InstalledPackage', () => {
  const fileName = 'Test.installedPackage-meta.xml';

  describe('.activateRSS', () => {
    context('when <activateRSS> is true', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <activateRSS>true</activateRSS>
      </InstalledPackage>`;

      it('returns true', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.activateRSS).to.equal(true);
      });
    });

    context('when <activateRSS> is false', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <activateRSS>false</activateRSS>
      </InstalledPackage>`;

      it('returns false', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.activateRSS).to.equal(false);
      });
    });

    context('when <activateRSS> is empty', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <activateRSS xsi:nil="true"/>
      </InstalledPackage>`;

      it('returns null', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.activateRSS).to.equal(null);
      });
    });

    context('when <activateRSS> element is not present', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <versionNumber>1.23</versionNumber>
      </InstalledPackage>`;

      it('returns undefined', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.activateRSS).to.equal(undefined);
      });
    });

    context('when <activateRSS> is not a boolean', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <activateRSS>17</activateRSS>
      </InstalledPackage>`;

      it('returns undefined', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.activateRSS).to.equal(undefined);
      });
    });
  });

  describe('.securityType', () => {
    context('when <securityType> contains a value', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <securityType>AllUsers</securityType>
      </InstalledPackage>`;

      it('returns the value as a string', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.securityType).to.equal('AllUsers');
      });
    });

    context('when <securityType> is empty', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <securityType></securityType>
      </InstalledPackage>`;

      it('returns an empty string', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.securityType).to.equal('');
      });
    });

    context('when <securityType> element is not present', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <versionNumber>1.23</versionNumber>
      </InstalledPackage>`;

      it('returns undefined', () => {
        const installedPackage = new InstalledPackage(fileName, xml);
        expect(installedPackage.securityType).to.equal(undefined);
      });
    });
  });
});
