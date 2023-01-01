import 'mocha';
import { expect } from 'chai';
import { Queue } from './queue';

describe('Queue', () => {
  const fileName = 'Test.queue-meta.xml';

  describe('.users()', () => {
    context('when there are no queue members', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <Queue xmlns="http://soap.sforce.com/2006/04/metadata">
            <doesSendEmailToMembers>false</doesSendEmailToMembers>
            <name>Test</name>
            <queueSobject>
                <sobjectType>Case</sobjectType>
            </queueSobject>
        </Queue>`;

      it('returns an empty array', () => {
        const queue = new Queue(fileName, xml);
        expect(queue.queueMembers().users().length).to.equal(0);
      });
    });

    context('when the queue has one user', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

      it('returns an array with one user', () => {
        const users = new Queue(fileName, xml).queueMembers().users();
        expect(users.length).to.equal(1);
        expect(users[0]).to.equal('test@test.com');
      });
    });

    context('when the queue has more than one user', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <Queue xmlns="http://soap.sforce.com/2006/04/metadata">
            <doesSendEmailToMembers>false</doesSendEmailToMembers>
            <name>Test</name>
            <queueMembers>
                <users>
                    <user>test1@test.com</user>
                    <user>test2@test.com</user>
                </users>
            </queueMembers>
            <queueSobject>
                <sobjectType>Case</sobjectType>
            </queueSobject>
        </Queue>`;

      it('returns an array of all the users', () => {
        const users = new Queue(fileName, xml).queueMembers().users();
        expect(users.length).to.equal(2);
        expect(users[0]).to.equal('test1@test.com');
        expect(users[1]).to.equal('test2@test.com');
      });
    });
  });
});
