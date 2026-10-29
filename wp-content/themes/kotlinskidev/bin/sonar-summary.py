import json
import sys

issues_path, hotspots_path = sys.argv[1], sys.argv[2]

with open(issues_path) as f:
    issues = json.load(f)
with open(hotspots_path) as f:
    hotspots = json.load(f)

print("## SonarQube Findings")
print()
print(f"**Open issues:** {issues.get('total', 0)}")
print(f"**Security hotspots to review:** {hotspots.get('paging', {}).get('total', 0)}")
print()

if issues.get("issues"):
    print("| Severity | Type | Rule | File:Line | Message |")
    print("|---|---|---|---|---|")
    for issue in issues["issues"][:100]:
        component = issue.get("component", "").split(":")[-1]
        line = issue.get("line", "")
        message = issue.get("message", "").replace("|", "\\|")
        print(
            f"| {issue.get('severity', '')} | {issue.get('type', '')} | "
            f"{issue.get('rule', '')} | {component}:{line} | {message} |"
        )
    remaining = issues.get("total", 0) - 100
    if remaining > 0:
        print(f"\n_...and {remaining} more — see the sonar-findings artifact for the full JSON._")
