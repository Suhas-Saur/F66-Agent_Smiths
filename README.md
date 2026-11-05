# PartSure AI: Agentic Intelligence for Safe Parts Procurement & Fulfilment
**Team**: F95-Agent_Smiths | **Challenge**: Workshop Parts Desk (v6)

---

## 1. Executive Summary & Core Mission
**PartSure AI** converts everyday workshop parts requests into safe, technically compatible, and inventory-verified fulfilment decisions.
- **Core Directive**: **Zero Incompatible Dispatches**. Any single incompatible dispatch causes the entire batch score to drop to 0. PartSure AI enforces a deterministic multi-stage safety gate that guarantees technical compatibility before any dispatch.
- **Shared Budget Optimization**: With 14 tool units shared across 6 natural-language requests, PartSure AI strategically balances information gain against tool cost (inspect: 1, verify: 2, clarify: 2), targeting tool spend $\le 13$ units to achieve full 5-point efficiency credit.

---

## 2. Architecture & Decision Pipeline

The controller implements a multi-stage agentic workflow:

1. **Approved Document Resolution & Lineage Tracking**:
   - In accordance with `OBSERVATIONS.md`, the controller resolves `request_documents` and `catalog_documents` to the latest approved revision as of `as_of` timestamp.
   - Automatically filters out unapproved drafts and late retries of older revisions.
   - Normalizes milliunit representations (`5000 mV` $\to$ `5V`, `10000 mW` $\to$ `10W`) and connector aliases (`USB Type-C` $\to$ `USB-C`).

2. **LLM Gateway Integration (`op: llm`)**:
   - Emits bounded `op: llm` request at batch start with natural-language request texts.
   - Interprets electrical requirements, equipment notes, and customer ambiguity.
   - Validates model output against strict JSON schemas and reconciles with deterministic safety extraction.
   - Strictly respects the 1–8 model calls per case limit.

3. **Deterministic Safety Enforcement**:
   - Voltage must match exactly ($5\text{V}, 12\text{V}, 24\text{V}$).
   - Connector must match exactly (`USB-C` vs `barrel`).
   - Wattage rating must be $\ge$ requested minimum ($10\text{W}$ or $20\text{W}$).
   - A $20\text{W}$ part satisfies either $10\text{W}$ or $20\text{W}$ requests, eliminating unnecessary customer clarifications.

4. **Strategic Inventory Verification**:
   - **Recent Snapshots**: Synchronized at batch open. An `inspect` call (cost 1) provides reliable stock information for recent parts, saving 1 unit compared to verify.
   - **Aged Snapshots**: Exactly 2 of 6 aged snapshots disagree with warehouse truth. For aged parts, authoritative warehouse truth is verified using `verify` (cost 2) when needed.

5. **Disruption & Fallback Policy**:
   - If no compatible candidate exists in the catalogue, the ticket is immediately escalated to a human at cost 0 (earning 100% useful escalation credit).
   - If the tool budget is exhausted or evidence is insufficient, safe escalation preserves batch integrity.

---

## 3. Official Execution & Submission Contract
- **Interface**: `def decide(observation, state)` returning `{'action': action, 'state': state}`.
- **Environment**: Python 3.12, standard library only, self-contained within `solution.py`.
- **Validation**: Zero invalid actions, zero incompatible dispatches, and zero unavailable dispatches across all public datasets.

### Running Official Tests & Benchmarks
```powershell
# 1. Run Unit Tests (20 comprehensive constraint & edge-case tests)
python -m unittest test_partsure.py

# 2. Benchmark on Smoke Dataset (2 cases)
python local_runner.py --dataset smoke.json --model openai/gpt-4.1-mini

# 3. Benchmark on Practice Dataset (12 cases)
python local_runner.py --dataset practice.json --model openai/gpt-4.1-mini

# 4. Benchmark on Training Dataset (40 cases)
python local_runner.py --dataset training.json --model openai/gpt-4.1-mini
```

---

## 4. Live Interactive Web Dashboard (Port 8991)
PartSure AI includes an enterprise-grade interactive web dashboard:
- **Port**: `http://localhost:8991`
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Express REST API (`dashboard/server/index.js`)

### Key Features:
- **Light / Dark Mode Toggle**: Instant theme switching in the top-right header (☀️ / 🌙).
- **Try Custom Input Sandbox**: Test custom natural-language workshop requests in real-time with automatic voltage, connector, and wattage extraction.
- **Full Trace & Visual Inspection**: Step-by-step visual matrix matching, tool budget consumption gauges, and irreversible decision audit trails.

To start the server manually:
```powershell
$env:PORT="8991"
node dashboard/server/index.js
```

---

## 5. Submission Packaging
Run the automated packaging script to verify and build `PartSure_AI_submission.zip`:
```powershell
python package_submission.py
```
This produces `PartSure_AI_submission.zip` containing `solution.py` and `README.md` directly at the archive root without subdirectories.
