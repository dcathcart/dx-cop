import 'mocha';
import { expect } from 'chai';
import { InstalledPackage } from './installedPackage';

describe('InstalledPackage', () => {
  const fileName = 'Test.installedPackage-meta.xml';

  describe('.activateRSS()', () => {
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
  });
});
