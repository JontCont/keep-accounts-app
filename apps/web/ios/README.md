# iOS Widget

The Widget target and Keep Accounts app share `group.com.keepaccounts.app`.

Before signing a build, enable the App Groups capability for both
`com.keepaccounts.app` and `com.keepaccounts.app.widget` in the Apple Developer
portal, then regenerate the provisioning profiles. The App and
KeepAccountsWidget targets must use the same App Group value.