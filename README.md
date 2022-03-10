# Openshift yaml validate javascript action


This action validates yaml templates.

## Inputs

## `files`

**Required** The path to the yaml to validate. Default `"openshift/temlpate.yaml"`.

## `kubernetes_mode`
The boolean flag when set to true validates only for kubernetes schemas

## `schema_url`
Provide a custom schema URL to validate your CRDs

## `GITHUB_TOKEN`
Github token is required to make a pull request comment

## `PULL Requests are turned off ATM`
## Example usage
Requires `redhat-actions/oc-installer` and `sawood14012/openshift-yaml-validate-action` for a successful run
```
- name: Install oc
  uses: redhat-actions/oc-installer@v1
  with:
    oc_version: '4.6'
- name: Install kubeval cli
  uses: sawood14012/setup-kubeval-cli@v1.1
  with:
    version: '0.16.1'
  uses: sawood14012/openshift-yaml-validate-action@v1
  with:
    yaml-path: './openshift'
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```
