/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export default function defaultConfig() {
  return {
    ruleSets: {
      emailToCaseSettings: { enabled: true },
      lightningWebComponents: { enabled: true },
      recordTypePicklists: { enabled: true },
      recordTypePicklistValues: { enabled: true },
    },
  };
}
