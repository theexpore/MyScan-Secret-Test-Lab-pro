/* Local-only fixture integrity check. This does not run MyScan itself. */
const manifest = {
  schema_version: "1.0",
  description: "Synthetic-only secret detection test ground truth. All values are nonfunctional.",
  expected_secret_count: 2,
  expected_false_positive_count: 0,
  findings: [
    {id:"SYNTH-001",file:"fixtures/api_key.py",line:2,variable:"TEST_API_KEY",expected_rule_family:"generic_api_key",expected_detection:true,synthetic:true},
    {id:"SYNTH-002",file:"fixtures/access_token.js",line:2,variable:"TEST_ACCESS_TOKEN",expected_rule_family:"generic_access_token",expected_detection:true,synthetic:true}
  ],
  negative_controls: [
    {id:"NEG-001",file:"fixtures/negative_controls.py",line:2,case:"ordinary value",value:"xyz",expected_detection:false},
    {id:"NEG-002",file:"fixtures/negative_controls.py",line:3,case:"placeholder",value:"test123",expected_detection:false},
    {id:"NEG-003",file:"fixtures/negative_controls.py",line:4,case:"dictionary word",value:"asianconstablebutterfly",expected_detection:false},
    {id:"NEG-004",file:"fixtures/negative_controls.py",line:6,case:"environment reference",value:'os.getenv("API_KEY")',expected_detection:false},
    {id:"NEG-005",file:"fixtures/negative_controls.py",line:7,case:"masked placeholder",value:"****REDACTED****",expected_detection:false}
  ]
};
let latestResult = null;
const $ = id => document.getElementById(id);
function download(name, content, type) {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
}
function runFixtureCheck() {
  const positiveOk = manifest.findings.length === 2 && manifest.findings.every(x => x.synthetic && x.expected_detection && x.file && x.line);
  const negativeOk = manifest.negative_controls.length === 5 && manifest.negative_controls.every(x => x.expected_detection === false);
  const ids = [...manifest.findings, ...manifest.negative_controls].map(x => x.id);
  const integrityOk = new Set(ids).size === 7 && manifest.expected_secret_count === manifest.findings.length;
  const checksPassed = Number(positiveOk) + Number(negativeOk) + Number(integrityOk);
  const score = Math.round(checksPassed / 3 * 100);
  latestResult = {
    generated_at: new Date().toISOString(),
    test_type: "browser_fixture_integrity_only",
    scanner_executed: false,
    status: checksPassed === 3 ? "PASS" : "FAIL",
    checks: {positive_fixture_coverage:positiveOk,negative_fixture_coverage:negativeOk,manifest_integrity:integrityOk},
    counts: {planted_secrets:manifest.findings.length,negative_controls:manifest.negative_controls.length,expected_scanner_detections:manifest.expected_secret_count,actual_scanner_detections:null,false_positives:null,false_negatives:null},
    note: "This result validates the test fixture manifest only. It is not evidence that MyScan detected or ignored any value."
  };
  $("detected").innerHTML = '— <span class="metric-unit">scanner not run</span>';
  $("falsePositives").innerHTML = '— <span class="metric-unit">scanner not run</span>';
  $("recall").innerHTML = '— <span class="metric-unit">scanner not run</span>';
  $("detectedFoot").textContent = "Fixture integrity verified; run MyScan CLI";
  $("positiveSummary").textContent = `${positiveOk ? 2 : 0} / 2`;
  $("negativeSummary").textContent = `${negativeOk ? 5 : 0} / 5`;
  $("manifestSummary").textContent = integrityOk ? "Valid" : "Invalid";
  $("score").textContent = score;
  $("scoreRing").style.background = `conic-gradient(#2db68b ${score}%, #e7e8ef ${score}% 100%)`;
  $("scoreTitle").textContent = checksPassed === 3 ? "Fixture integrity passed" : "Fixture check failed";
  $("scoreDesc").textContent = checksPassed === 3 ? "All seven expected cases are present and uniquely identified. Scanner results are not included." : "One or more manifest integrity checks failed.";
  $("runStatus").textContent = checksPassed === 3 ? "FIXTURES VALID" : "CHECK FAILED";
  $("runStatus").className = `tag ${checksPassed === 3 ? "neutral" : "high"}`;
  $("state1").textContent = "Fixture valid"; $("state1").className = "finding-state pass";
  $("state2").textContent = "Fixture valid"; $("state2").className = "finding-state pass";
  $("downloadResult").disabled = false;
  toast(checksPassed === 3 ? "Fixture integrity check passed. MyScan was not executed." : "Fixture manifest validation failed.");
}
$("runDemo").addEventListener("click", runFixtureCheck);
$("reset").addEventListener("click", () => {
  latestResult = null;
  $("detected").innerHTML = '— <span class="metric-unit">of 2 expected</span>';
  $("falsePositives").innerHTML = '— <span class="metric-unit">findings</span>';
  $("recall").innerHTML = '— <span class="metric-unit">%</span>';
  $("detectedFoot").textContent = "Run a test to evaluate";
  $("positiveSummary").textContent = "0 / 2"; $("negativeSummary").textContent = "0 / 5"; $("manifestSummary").textContent = "Not checked";
  $("score").textContent = "—"; $("scoreRing").style.background = "conic-gradient(#e7e8ef 0 100%)";
  $("scoreTitle").textContent = "Ready to test"; $("scoreDesc").textContent = "Run the local fixture check to verify the manifest and case coverage.";
  $("runStatus").textContent = "NOT RUN"; $("runStatus").className = "tag neutral";
  ["state1","state2"].forEach(id => { $(id).textContent = "Pending"; $(id).className = "finding-state pending"; });
  $("downloadResult").disabled = true; toast("Test state reset.");
});
function exportManifest(){download("ground-truth.json", JSON.stringify(manifest,null,2), "application/json");}
$("downloadManifest").addEventListener("click", exportManifest);
$("exportGroundTruth").addEventListener("click", exportManifest);
$("downloadResult").addEventListener("click", () => { if(latestResult) download("fixture-integrity-result.json",JSON.stringify(latestResult,null,2),"application/json"); });
