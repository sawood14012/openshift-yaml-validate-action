# Openshift yaml validate javascript action

This action validates yaml templates.

## Inputs

## `yaml-path`

**Required** The path to the yaml to validate. Default `"openshift/temlpate.yaml"`.

## `is_dir`
The boolean flag when set to true validates all the yamls found in the directory provided in the path
## Example usage
```
uses: actions/hello-world-javascript-action@v1.1
with:
  yaml-path: './openshift'
  is_dir: true

```