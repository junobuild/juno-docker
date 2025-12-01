# Administration

A few notes about the maintenance.

## Canisters Commit Hashes

When you need to determine which canister versions are used by PocketIC, follow these steps:

### 1. Locate the PocketIC Release

Navigate to the specific release page on GitHub. For example, for version `v10.0.0`:
```
https://github.com/dfinity/pocketic/releases/tag/10.0.0
```

### 2. Extract the IC Commit Hash

Find the commit hash listed in the release notes. It will appear in this format:

```
Commit hash: a299620cd5e73ed21b415f2ebe3da0bb43a3649d
```

### 3. View Mainnet Canister Versions

Use the commit hash to access the corresponding mainnet canister revisions file:

```
https://github.com/dfinity/ic/blob/[COMMIT_HASH]/mainnet-canister-revisions.json
```

**Example:**
```
https://github.com/dfinity/ic/blob/a299620cd5e73ed21b415f2ebe3da0bb43a3649d/mainnet-canister-revisions.json
```

This file contains the exact versions of all mainnet canisters associated with that IC commit.