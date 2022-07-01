# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (or rather, it _will_ once there are enough features to be considered "ready" for version 0.1).

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
