import 'mocha';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { JsonMap } from '@salesforce/ts-types';
import { CustomField } from '../../metadata_browser/CustomField';

describe('CustomField', () => {
  it('should return the correct values for all properties', () => {
    const json: JsonMap = { required: true, type: 'Text' };
    const customField = new CustomField('');
    Sinon.stub(customField, 'metadata').get(() => json);

    expect(customField.dataType).to.equal('Text');
    expect(customField.required).to.equal(true);
  });
});
