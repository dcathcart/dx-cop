# DX Cop

### Static analysis for your Saleforce git repository

[sfdx-cli](https://developer.salesforce.com/tools/sfdxcli) [plugin](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_plugins.meta/sfdx_cli_plugins/cli_plugins.htm) that runs over a Salesforce git repository and scans for metadata problems. Inspired by tools like [RuboCop](https://github.com/rubocop/rubocop) and [ESLint](https://github.com/eslint/eslint). Unlike many CLI plugins, this tool does not connect to any Salesforce orgs; it simply examines the metadata XML.

Features are drawn largely from experience in working with Salesforce projects. To the best of my knowledge there is no "style guide" for Salesforce metadata; instead this is based on common pitfalls and traps from actual projects. For example: you remove a picklist value, but forget to update your record types. The picklist will likely deploy successfully, but the record types will fail when you try to deploy them in the future. This plugin will help you find such problems.

Integrate into your Salesforce CI jobs to keep your repo clean and find deployment problems before they happen!

## Usage

To install:

`sfdx plugins:install dx-cop`

To run, clone and cd into your Salesforce git repo, then

`sfdx dxcop:source:check`

or to format output as JSON:

`sfdx dxcop:source:check --json`

There are no other parameters; running the above command performs all known checks. Returns exit code 1 if any metadata problems are found, for easy integration into CI jobs.

## Checks performed

This plugin is new - please be kind! There are currently only a small number of checks, but the list is growing.

### Record types: picklist values

Examines record types & checks for picklist values that don't exist (or are inactive) in the corresponding picklist field definitions.

### Record types: picklist names

When you add a new picklist field to an object, Salesforce automatically adds a reference to that picklist to the metadata for every record type. This check ensures you remember to add the record type changes to git as well.

### Lightning web components

Checks `*.js-meta.xml` files for extra whitespace at the ends of lines. This can cause unexpected behaviour when you retrieve the same component after deployment; extra lines of whitespace can be inserted resulting in unexpected file differences.

### Email-to-Case settings

Ensures you don't have the `<emailServicesAddress>` and `<isVerified>` fields stored in version control. These are specific to each environment and usually cause validation failures if you try to change them in a deployment, so it's best not to store them at all.

Also ensures that `<routingAddresses>` are ordered by `<routingName>`.

## Problem categories

### Errors

Metadata Errors are conditions that would in all likelihood prevent a component from being deployed, due to a Salesforce validation error. This tool does not aim to find all validation errors; rather it focuses on the ones that can be easily missed, only to surface later. e.g. when a record type references a picklist value that no longer exists.

### Warnings

Metadata Warnings are conditions that usually *don't* result in a validation/deployment errors, but could still cause problems later. Often the result of a new component causing changes to other components, but only the first component is committed to git. The potential 'later' problems could include:
- merge conflicts
- config intended by the developer is missed
- unexpected differences when retrieving components from an org

## Limitations

### Project structure

The most notable limitation is that currently, multiple packages are not supported. Only the default package according to your `sfdx-project.json` is examined.

### Picklists

Picklists based on **standard value sets** or **global value sets** are currently ignored.

### Objects &amp; fields

**PersonAccount**, **Event** and **Task** objects are currently ignored. These non-standard objects will require some special handling, which hasn't been built yet.

**ForecastCategoryName** fields are also ignored.