# DX Cop

### Static analysis for your Saleforce git repository

[sfdx-cli](https://developer.salesforce.com/tools/sfdxcli) [plugin](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_plugins.meta/sfdx_cli_plugins/cli_plugins.htm) that runs over a Salesforce git repository and scans for metadata problems. It does not (and in fact cannot) connect to any Salesforce orgs - it simply examines the metadata XML.

For example: you remove a picklist value, but forget to update your record types. The picklist will likely deploy successfully, but the record types will fail when you try to deploy them in the future, because they reference a picklist value that no longer exists. This plugin will help you find such problems early.

Integrate into your Salesforce CI jobs to keep your repo clean and find deployment problems before they happen!

## Usage

`sfdx dxcop:source:check`

Or, to format output as JSON:

`sfdx dxcop:source:check --json`

There are no parameters yet; running the above command performs all known checks.

## Types of problems

This plugin is new - please be kind! There are currently only a small number of checks, but the list is growing.

### Record types: picklist values

Examines record types & checks for picklist values that don't exist in the picklist field definitions. **Note**: currently does not check picklists that make use of standard value sets or global value sets.

### Record types: picklist _names_

When you add a new picklist field to an object, Salesforce automatically adds a reference to that picklist to the metadata for every record type. This check ensures you remember to add the record type changes to git as well.

### Lightning web components

Checks `*.js-meta.xml` files for extra whitespace at the ends of lines. This can cause unexpected behaviour when you retrieve the same component after deployment; extra lines of whitespace can be inserted resulting in unexpected file differences.