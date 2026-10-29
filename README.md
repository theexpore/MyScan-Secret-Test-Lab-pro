# Sentinel Secret Detection Lab

A standalone fixture repository for validating MyScan secret-detection behavior.

## Safety and scope

All planted values are synthetic and nonfunctional. Never replace them with live credentials. The web UI works locally and makes no network requests except that the stylesheet may load Google Fonts when online. The browser-side test validates fixture/manifest integrity only; it does **not** execute MyScan.

## Run the UI

Open `index.html` in a modern browser. Click **Run local fixture test** to check that the manifest contains two positive fixtures, five negative controls, and seven unique case IDs. Download the ground-truth manifest or the browser integrity result.

## Ground truth

- Two synthetic positive fixtures: `fixtures/api_key.py` and `fixtures/access_token.js`.
- Five negative controls: ordinary value `xyz`, placeholder `test123`, dictionary word `asianconstablebutterfly`, `os.getenv("API_KEY")`, and masked value `****REDACTED****`.
- Expected scanner result: detect both positive fixtures and do not flag any negative controls.

The manifest is stored in `ground-truth.json`. Line numbers refer to the checked-in fixture files.

## Test with MyScan

From the MyScan environment, first check supported CLI options:

```bash
myscan scan --help
```

Then scan this directory using your installed CLI's local scan option. Export JSON and SARIF reports **outside** this directory so the scanner does not scan its own reports. Example syntax (adjust flags to match your version):

```bash
myscan scan /path/to/myscan-secret-test-lab-pro --local --format json --output /tmp/myscan-lab.json
myscan scan /path/to/myscan-secret-test-lab-pro --local --format sarif --output /tmp/myscan-lab.sarif
```

Validate the output against the manifest by matching rule, file, and line. Report true positives, false positives, false negatives, and unverified findings separately. Redact all detected values in logs and exported reports.

## Honest metrics

Do not treat the browser fixture-integrity score as scanner precision or recall. Real scanner metrics can only be calculated after scanning the repository and comparing actual findings with the ground truth.
