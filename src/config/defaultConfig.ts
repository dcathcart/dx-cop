/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export default function defaultConfig() {
  return {
    ruleSets: {
      adminProfile: { enabled: false },
      emailToCaseSettings: { enabled: true },
      lightningWebComponents: { enabled: true },
      minimumAccessProfile: { enabled: false },
      recordTypePicklists: { enabled: true },
      recordTypePicklistValues: { enabled: true },
    },
  };
}
