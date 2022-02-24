# Openshift yaml validate javascript action

This action validates yaml templates.

## Inputs

## `files`

**Required** The path to the yaml to validate. Default `"openshift/temlpate.yaml"`.

## `kubernetes_mode`
The boolean flag when set to true validates only for kubernetes schemas
## Example usage
```
uses: sawood14012/openshift-yaml-validate-action@v1
with:
  yaml-path: './openshift'

```