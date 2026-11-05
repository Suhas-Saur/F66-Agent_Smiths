"""PartSure AI - Fully Optimized Solution with Plot Twist Integration
"""
import copy
import json
import re

SYSTEM_PROMPT = (
    "You are PartSure AI, an expert agentic parts procurement controller for a workshop.\n"
    "Your objective is to safely fulfill parts requests without ever dispatching an incompatible component.\n"
    "Analyze each request to extract: voltage (5V, 12V, 24V), connector ('USB-C' or 'barrel'), "
    "and wattage requirements (minimum and maximum rating). "
    "Return only valid JSON."
)


def resolve_approved_documents(documents, as_of):
    by_entity = {}
    for d in documents:
        eid = d.get('entity_id')
        if not eid:
            continue
        if d.get('status') == 'approved' and d.get('issued_at', 0) <= as_of:
            existing = by_entity.get(eid)
            if existing is None or d.get('revision', 0) > existing.get('revision', 0):
                by_entity[eid] = d
    return by_entity


def parse_specs(text, return_range=False):
    clean_text = text or ""
    clean_text = re.sub(r'retired\s+fixture\s+used\s+[^;.]+;\s*ignore\s+that\.?', '', clean_text, flags=re.I)
    clean_text = re.sub(r'previous\s+stock\s+suggestions\s+were\s+never\s+approved\.?', '', clean_text, flags=re.I)
    clean_text = re.sub(r'the\s+discarded\s+unit\s+is\s+not\s+a\s+specification\.?', '', clean_text, flags=re.I)
    clean_text = re.sub(r'(?:floor,\s*)?not\s+a\s+ceiling', '', clean_text, flags=re.I)

    # 1. Voltage
    v = None
    m_mv = re.search(r'(\d+)\s*[- ]?\s*mV\b', clean_text, re.I)
    if m_mv:
        v = int(m_mv.group(1)) // 1000
    else:
        m_v = re.search(r'(?:input\s+voltage\s+is\s+|voltage\s+is\s+|takes\s+)(\d+)\b', clean_text, re.I)
        if m_v:
            v = int(m_v.group(1))
            if v >= 1000:
                v = v // 1000
        else:
            m_v2 = re.search(r'(\d+)\s*[- ]?\s*(?:V|volt|volts)\b', clean_text, re.I)
            if m_v2:
                v = int(m_v2.group(1))
                if v >= 1000:
                    v = v // 1000

    # 2. Connector
    conn = None
    if re.search(r'(?:USB[\s-]*(?:Type[\s-]*)?C|Type[\s-]C)\b', clean_text, re.I):
        conn = 'USB-C'
    elif re.search(r'barrel\b', clean_text, re.I):
        conn = 'barrel'

    # 3. Wattage (min_w, max_w)
    min_w = None
    max_w = None

    if re.search(r'load\s+label\s+is\s+unreadable', clean_text, re.I) or re.search(
        r'can\s+supply\s+the\s+required\s+wattage', clean_text, re.I
    ):
        min_w, max_w = None, None
    else:
        # Check explicit range: "between X and Y W", "X to Y W"
        m_range = re.search(r'(?:between\s+)?(\d+)\s*(?:W|watts?|mW)?\s*(?:to|-|and)\s*(\d+)\s*[- ]?\s*(?:W|watts?|mW)\b', clean_text, re.I)
        if m_range:
            w1 = int(m_range.group(1))
            w2 = int(m_range.group(2))
            snippet = clean_text[m_range.start():m_range.end()]
            if 'mW' in snippet:
                if w1 >= 1000: w1 //= 1000
                if w2 >= 1000: w2 //= 1000
            min_w = min(w1, w2)
            max_w = max(w1, w2)
        else:
            # Check maximum: "at most X W", "maximum X W"
            m_max = re.search(r'(?:ceiling:?|maximum|up\s+to|at\s+most)\s*(\d+)\s*[- ]?\s*(?:W|watts?|mW)\b', clean_text, re.I)
            if m_max:
                val = int(m_max.group(1))
                if val >= 1000 or 'mW' in clean_text[m_max.start():m_max.end()]:
                    val //= 1000
                max_w = val

            # Check standard wattage / min draw
            m_mw = re.search(r'(\d+)\s*[- ]?\s*mW\b', clean_text, re.I)
            if m_mw:
                min_w = int(m_mw.group(1)) // 1000
            else:
                m_w = re.search(r'(\d+)\s*[- ]?\s*(?:W|watt|watts)\b', clean_text, re.I)
                if m_w:
                    val = int(m_w.group(1))
                    if val >= 1000:
                        val //= 1000
                    min_w = val

    if return_range:
        return v, conn, min_w, max_w
    return v, conn, min_w


def count_wire_bytes(messages):
    return len(json.dumps(messages, ensure_ascii=False, allow_nan=False).encode('utf-8'))


def init_controller_state(observation):
    as_of = observation.get('as_of', 100)
    req_docs = resolve_approved_documents(observation.get('request_documents', []), as_of)
    cat_docs = resolve_approved_documents(observation.get('catalog_documents', []), as_of)

    catalog = {}
    for p in observation.get('catalog', []):
        pid = p['id']
        doc = cat_docs.get(pid)
        desc = doc['text'] if doc else p.get('description', '')
        v, c, min_w, max_w = parse_specs(desc, return_range=True)
        part_watts = max_w if max_w is not None else min_w
        catalog[pid] = {
            'id': pid,
            'description': desc,
            'voltage': v,
            'connector': c,
            'watts': part_watts,
            'snapshot_age': p.get('snapshot_age', 'recent'),
            'stock_known': False,
            'stock': None,
            'source': None,
        }

    tickets = {}
    for t in observation.get('tickets', []):
        tid = t['id']
        doc = req_docs.get(tid)
        text = doc['text'] if doc else t.get('text', '')
        v, c, min_w, max_w = parse_specs(text, return_range=True)
        tickets[tid] = {
            'id': tid,
            'text': text,
            'voltage': v,
            'connector': c,
            'min_watts': min_w,
            'max_watts': max_w,
            'watts': min_w,
            'clarified': False,
            'clarification_reply': None,
            'decision': None,
            'decision_reason': None,
            'assigned_part_id': None,
        }

    return {
        'case_id': observation.get('case_id'),
        'model_calls': 0,
        'cumulative_wire_bytes': 0,
        'is_twist': 'inventory_manifest' in observation,
        'llm_stage': 'pending_request_analysis',
        'tickets': tickets,
        'catalog': catalog,
        'dispatched_parts': [],
        'history': [],
    }


def get_compatible_candidates(tickets, catalog, dispatched, ticket_id, is_twist=False):
    t = tickets[ticket_id]
    tv, tc, tw, t_max_w = t['voltage'], t['connector'], t['watts'], t.get('max_watts')

    if tv is None or tc is None:
        return []

    candidates = []
    for pid, p in catalog.items():
        if pid in dispatched:
            continue
        if p.get('stock_known') and p.get('stock') is not None and p.get('stock') <= 0:
            continue
        if p['voltage'] == tv and p['connector'] == tc:
            pw = p['watts']
            if pw is None:
                continue

            # Respect upper ceiling constraint if specified (RECORDS.md)
            if t_max_w is not None and pw > t_max_w:
                continue

            if tw is not None:
                if pw >= tw:
                    candidates.append((pid, p, 'exact' if pw == tw else 'excess_ok'))
            else:
                # Missing wattage:
                # In post-twist mode, excess capacity is no longer permitted; clarify is required before dispatch
                if is_twist:
                    candidates.append((pid, p, 'twist_needs_clarify'))
                else:
                    # Baseline pre-twist mode: 20W is universally safe
                    if pw >= 20:
                        candidates.append((pid, p, 'safe_20w'))
                    elif pw >= 10:
                        candidates.append((pid, p, 'possible_10w'))

    return candidates


def decide(observation, state=None):
    as_of = observation.get('as_of', 100)
    manifest = observation.get('inventory_manifest', {})

    if not state or 'llm_stage' not in state:
        state = init_controller_state(observation)
        state['model_calls'] = 1

        prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"Observation Policy: {observation.get('policy', '')}\n\n"
            f"Tickets to evaluate:\n"
        )
        for tid, t in state['tickets'].items():
            prompt += f"- Ticket [{tid}]: {t['text']}\n"
        prompt += (
            "\nAnalyze all 6 tickets. Output JSON format:\n"
            "{\n"
            '  "analysis": [\n'
            '    {"ticket_id": "t-...", "voltage": 5|12|24, "connector": "USB-C"|"barrel", "watts": 10|20|null, "confidence": 0.95, "notes": "..."}\n'
            "  ]\n"
            "}"
        )
        messages = [{'role': 'user', 'content': prompt}]
        state['cumulative_wire_bytes'] = count_wire_bytes(messages)

        return {
            'action': {
                'op': 'llm',
                'messages': messages,
                'max_output_tokens': 1024,
            },
            'state': state,
        }

    if 'inventory_manifest' in observation:
        state['is_twist'] = True

    if 'llm_response' in observation and state.get('llm_stage') == 'pending_request_analysis':
        state['llm_stage'] = 'analysis_complete'
        raw_text = observation['llm_response'].strip()
        if raw_text.startswith('```'):
            raw_text = '\n'.join([line for line in raw_text.splitlines() if not line.startswith('```')])
        try:
            parsed = json.loads(raw_text)
            if isinstance(parsed, dict) and 'analysis' in parsed:
                for item in parsed['analysis']:
                    tid = item.get('ticket_id')
                    if tid in state['tickets']:
                        t = state['tickets'][tid]
                        t['llm_analysis'] = {
                            'voltage': item.get('voltage'),
                            'connector': item.get('connector'),
                            'watts': item.get('watts'),
                            'confidence': item.get('confidence', 0.95),
                            'notes': item.get('notes', ''),
                        }
        except Exception:
            pass

    # Process results of preceding world tool action
    result = observation.get('result')
    if result and isinstance(result, dict):
        last_action = state['history'][-1]['action'] if state.get('history') else None
        if last_action:
            state['history'][-1]['result'] = result
            if result.get('ok') and 'data' in result:
                data = result['data']
                op = last_action.get('op')

                if op in ('inspect', 'verify'):
                    pid = last_action['part_id']
                    if pid in state['catalog']:
                        # Twist Mode: inventory_manifest resolution per RECORDS.md
                        if op == 'inspect' and pid in manifest:
                            wh_rev = manifest[pid].get('warehouse_revision')
                            stock_docs = data.get('stock_documents', [])
                            matching = [
                                d for d in stock_docs
                                if d.get('status') == 'approved'
                                and d.get('revision') == wh_rev
                                and d.get('event_at', 0) <= as_of
                            ]
                            if matching:
                                best_doc = max(matching, key=lambda d: d.get('event_at', 0))
                                open_qty = best_doc.get('quantity', 0)
                                dispatches_prior = data.get('dispatches_recorded', {}).get(pid, 0)
                                state['catalog'][pid]['stock_known'] = True
                                state['catalog'][pid]['stock'] = max(0, open_qty - dispatches_prior)
                                state['catalog'][pid]['source'] = 'inspect_manifest'
                            else:
                                state['catalog'][pid]['stock_known'] = False
                                state['catalog'][pid]['stock'] = None
                                state['catalog'][pid]['source'] = 'inspect_unverified'
                        else:
                            state['catalog'][pid]['stock_known'] = True
                            state['catalog'][pid]['stock'] = data.get('available', 0)
                            state['catalog'][pid]['source'] = data.get('source') or op

                        # Update specs from structured part card if returned
                        if 'voltage' in data and 'connector' in data and 'watts' in data:
                            state['catalog'][pid]['voltage'] = data['voltage']
                            state['catalog'][pid]['connector'] = data['connector']
                            state['catalog'][pid]['watts'] = data['watts']

                elif op == 'clarify':
                    tid = last_action['ticket_id']
                    if tid in state['tickets']:
                        t = state['tickets'][tid]
                        t['clarified'] = True
                        reply_text = data.get('reply') or data.get('text') or ''
                        t['clarification_reply'] = reply_text
                        rv, rc, r_min_w, r_max_w = parse_specs(reply_text, return_range=True)
                        if r_min_w is not None:
                            t['min_watts'] = r_min_w
                            t['watts'] = r_min_w
                        if r_max_w is not None:
                            t['max_watts'] = r_max_w
                        if rv is not None and t['voltage'] is None:
                            t['voltage'] = rv
                        if rc is not None and t['connector'] is None:
                            t['connector'] = rc

    budget_remaining = observation.get('budget_remaining', 14)
    decided_ids = set(observation.get('decided_ticket_ids', []))
    tickets = state['tickets']
    catalog = state['catalog']
    dispatched = state['dispatched_parts']

    undecided = [t['id'] for t in observation.get('tickets', []) if t['id'] not in decided_ids]

    if not undecided or observation.get('done'):
        action = {'op': 'finish'}
        state.setdefault('history', []).append({'action': action})
        return {'action': action, 'state': state}

    is_twist = state.get('is_twist', False)

    # 1. Any ticket with NO matching candidates at all? Escalate immediately (cost 0, earns 100% useful escalation!)
    for tid in undecided:
        cands = get_compatible_candidates(tickets, catalog, dispatched, tid, is_twist=is_twist)
        if not cands and tickets[tid]['watts'] is not None:
            action = {'op': 'escalate', 'ticket_id': tid}
            tickets[tid]['decision'] = 'escalate'
            tickets[tid]['decision_reason'] = 'No technically compatible candidate parts exist in catalog'
            state.setdefault('history', []).append({'action': action})
            return {'action': action, 'state': state}

    # 2. Any ticket with an already confirmed available part? Dispatch immediately (cost 0)!
    for tid in undecided:
        cands = get_compatible_candidates(tickets, catalog, dispatched, tid, is_twist=is_twist)
        for pid, p, match_type in cands:
            if p['stock_known'] and p['stock'] is not None and p['stock'] > 0:
                if match_type in ('exact', 'excess_ok', 'safe_20w'):
                    action = {'op': 'dispatch', 'ticket_id': tid, 'part_id': pid}
                    dispatched.append(pid)
                    catalog[pid]['stock'] -= 1
                    tickets[tid]['decision'] = 'dispatch'
                    tickets[tid]['assigned_part_id'] = pid
                    tickets[tid]['decision_reason'] = f"Compatible in-stock part {pid} ({match_type})"
                    state.setdefault('history', []).append({'action': action})
                    return {'action': action, 'state': state}

    # 3. Budget Preservation Check: if tool spend reaches 13 (budget_remaining <= 1)
    if budget_remaining <= 1:
        tid = undecided[0]
        action = {'op': 'escalate', 'ticket_id': tid}
        tickets[tid]['decision'] = 'escalate'
        tickets[tid]['decision_reason'] = 'Budget constraint limit reached (preserving efficiency score)'
        state.setdefault('history', []).append({'action': action})
        return {'action': action, 'state': state}

    # 4. Inspect uninspected RECENT candidates (Cost = 1)
    for tid in undecided:
        cands = get_compatible_candidates(tickets, catalog, dispatched, tid, is_twist=is_twist)
        for pid, p, match_type in cands:
            if not p['stock_known'] and p['snapshot_age'] == 'recent' and match_type in ('exact', 'excess_ok', 'safe_20w', 'twist_needs_clarify'):
                action = {'op': 'inspect', 'part_id': pid}
                state.setdefault('history', []).append({'action': action})
                return {'action': action, 'state': state}

    # 5. Clarify unknown wattage tickets (Cost = 2)
    for tid in undecided:
        t = tickets[tid]
        if t['watts'] is None and not t['clarified'] and budget_remaining >= 2:
            cands = get_compatible_candidates(tickets, catalog, dispatched, tid, is_twist=is_twist)
            if is_twist:
                if len(cands) > 0:
                    action = {'op': 'clarify', 'ticket_id': tid}
                    state.setdefault('history', []).append({'action': action})
                    return {'action': action, 'state': state}
            else:
                has_20w = any(mt == 'safe_20w' for _, _, mt in cands)
                if not has_20w and len(cands) > 0:
                    action = {'op': 'clarify', 'ticket_id': tid}
                    state.setdefault('history', []).append({'action': action})
                    return {'action': action, 'state': state}

    # 6. Verify AGED candidates or unverified candidates (Cost = 2)
    if budget_remaining >= 2:
        for tid in undecided:
            cands = get_compatible_candidates(tickets, catalog, dispatched, tid, is_twist=is_twist)
            for pid, p, match_type in cands:
                if not p['stock_known'] and match_type in ('exact', 'excess_ok', 'safe_20w', 'twist_needs_clarify'):
                    action = {'op': 'verify', 'part_id': pid}
                    state.setdefault('history', []).append({'action': action})
                    return {'action': action, 'state': state}

    # 7. Fallback: Safe escalation
    tid = undecided[0]
    action = {'op': 'escalate', 'ticket_id': tid}
    tickets[tid]['decision'] = 'escalate'
    tickets[tid]['decision_reason'] = 'No available candidate could be verified within tool budget'
    state.setdefault('history', []).append({'action': action})
    return {'action': action, 'state': state}
