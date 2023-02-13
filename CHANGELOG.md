# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (or rather, it _will_ once there are enough features to be considered "ready" for version 0.1).

## [0.0.12] - 2023-02-13

### Installed Packages ruleset

New ruleset to check installed packages. Detects the common issue where installed packages retrieved from an environment contain an empty element `<activateRSS xsi:nil="true"/>`, which will not deploy.

This ruleset is enabled by default. If you wish to explicity enable or disable, add the following to your `.dxcoprc` config file:

```
      "installedPackages": { "enabled": true },
```

### Security updates

Dependent packages `minimatch` and `json5` have been updated to address recently-discovered security vulnerabilities.

## [0.0.11] - 2023-01-01

New Year's Day Sale edition: 2 for the price of 1!

This release includes 2 new rulesets:

### Minimum Access Profile ruleset
Ensure the Minimum Access profiles remains a _true_ minimum access profile (i.e. no access to any objects or fields). Forces the preferred approach of using permission sets.

### Queues ruleset
Warns if any users are found to be direct members of queues. Forces use of public groups or roles instead.

### Configuration
Both rulesets are **disabled** by default; they can be enabled by adding to the `.dxcoprc` file:

```
      "minimumAccessProfile": { "enabled": true, "profileName": "Minimum Access - Salesforce" },
      "queues": { "enabled": false },
```

## [0.0.10] - 2022-11-16

Relax the `<fieldPermissions>` checks in the Admin profile ruleset, so that formula fields do not require `<editable>` to be true.

## [0.0.9] - 2022-07-02

Extends the Admin profile ruleset to cover more objects. Now includes standard objects (custom fields only), custom metadata types and external objects.

Record type rulesets now check the **Event** and **Task** objects as well; previously these were ignored.

## [0.0.8] - 2022-06-07

Fixes bug in Admin profile ruleset: was trying to enforce `<editable>` to be true for all fields, even standard fields that cannot be made editable. Reduces the scope of the ruleset, to only apply the rule to custom objects for the time being.

## [0.0.7] - 2022-05-15

Add a new ruleset that checks the System Administrator profile; specifically that it has access to all objects & fields, and that they are sorted correctly. See the [readme](https://github.com/dcathcart/dx-cop#admin-profile#admin-profile) for more details.

## [0.0.6] - 2022-04-25

Add ability to enable/disable individual rulesets via a `.dxcoprc` config file.

## [0.0.5] - 2022-04-20

Fix bug in Email-to-Case settings sort order check; no longer raises a warning for two adjecent entries with the same `<routingName>`.

## [0.0.4] - 2022-04-14

Update package versions to remove some security vulnerabilities.

Add tests & CI workflow.

## [0.0.3] - 2022-04-03

Add checks for Email-to-Case settings.

## [0.0.2] - 2022-03-22

- Add some very basic log output as checks occur
- Expand the README, including current limitations

While this release introduces only minor changes to functionality, it represents an almost complete rewrite! The new class structure is far better suited for expansion going forward.

## [0.0.1] - 2022-03-14

First ever published version! Contains some basic checks that run over:
- Lightning web components
- Record type picklists
- Record type picklist values
