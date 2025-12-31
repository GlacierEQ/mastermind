CASE_CONTEXT = {
    "case_id": "1FDV-23-0001009",
    "court": "Hawaii Family Court, First Circuit",
    "priority": "Rule 60(b) Motion to Vacate",
    "targets": ["Scot Stuart Brower (Bar #A3396)"],
    "critical_precedent": ["JK v. DK (HI 2023)", "BDM v. Sageco 57 Haw. 73 (1976)"]
}

def get_context():
    return json.dumps(CASE_CONTEXT, indent=2)

if __name__ == "__main__":
    print(f"OPR-LEGA-001 ONLINE. Target: {CASE_CONTEXT['case_id']}")
