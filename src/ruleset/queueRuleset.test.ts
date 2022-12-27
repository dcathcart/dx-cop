import 'mocha';
import { expect } from 'chai';
import sinon = require('sinon');
import { SfdxProjectBrowser } from '../metadata_browser/sfdxProjectBrowser';
import { Queue } from '../metadata_browser/queue';
import { QueueRuleset } from './queueRuleset';

describe('QueueRuleset', () => {
  describe('.run()', () => {
    const queueWithNoUsersXml = `<?xml version="1.0" encoding="UTF-8"?>
    <Queue xmlns="http://soap.sforce.com/2006/04/metadata">
        <doesSendEmailToMembers>false</doesSendEmailToMembers>
        <name>Test</name>
        <queueSobject>
            <sobjectType>Case</sobjectType>
        </queueSobject>
    </Queue>`;

    const queueWithUsersXml = `<?xml version="1.0" encoding="UTF-8"?>
    <Queue xmlns="http://soap.sforce.com/2006/04/metadata">
        <doesSendEmailToMembers>false</doesSendEmailToMembers>
        <name>Test</name>
        <queueMembers>
            <users>
                <user>test@test.com</user>
            </users>
        </queueMembers>
        <queueSobject>
            <sobjectType>Case</sobjectType>
        </queueSobject>
    </Queue>`;

    const queueWithNoUsers = new Queue('Test1.queue-meta.xml', queueWithNoUsersXml);
    const queueWithUsers = new Queue('Test2.queue-meta.xml', queueWithUsersXml);

    it('returns a warning if a queue has users', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      sinon.stub(sfdxProjectBrowser, 'queues').returns([queueWithNoUsers, queueWithUsers]);

      const ruleset = new QueueRuleset(sfdxProjectBrowser);
      const results = ruleset.run();

      expect(results.length).to.equal(1);
    });
  });
});
