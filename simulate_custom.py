"""Evaluate a custom natural-language request against a case catalog."""
import argparse
import json
import solution


def evaluate_custom_request(dataset_path='practice.json', case_index=0, custom_text='', override_v=None, override_c=None, override_w=None):
    with open(dataset_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if case_index >= len(data):
        case_index = 0

    record = data[case_index]
    case_world = record['world']
    as_of = record['observation'].get('as_of', 100)

    # Initialize controller state
    ctrl_state = solution.init_controller_state(record['observation'])
    catalog = ctrl_state['catalog']

    # Parse specs
    parsed_v, parsed_c, parsed_w = solution.parse_specs(custom_text) if custom_text else (None, None, None)
    v = override_v if override_v is not None else parsed_v
    c = override_c if override_c is not None else parsed_c
    w = override_w if override_w is not None else parsed_w

    # Evaluate against catalog
    candidates = []
    eligible_parts = []
    for pid, p in catalog.items():
        v_match = (v is not None) and (p['voltage'] == v)
        c_match = (c is not None) and (p['connector'] == c)
        w_match = False
        if w is not None:
            w_match = p['watts'] >= w
        else:
            w_match = p['watts'] >= 20  # Safe 20W policy

        is_compat = v_match and c_match and w_match

        cand_info = {
            'part_id': pid,
            'description': p['description'],
            'voltage': p['voltage'],
            'connector': p['connector'],
            'watts': p['watts'],
            'snapshot_age': p['snapshot_age'],
            'v_match': v_match,
            'c_match': c_match,
            'w_match': w_match,
            'compatible': is_compat,
        }
        candidates.append(cand_info)
        if is_compat:
            eligible_parts.append(cand_info)

    decision = 'escalate'
    assigned_part_id = None
    reason = ''

    if not v or not c:
        decision = 'escalate'
        reason = 'Missing essential electrical specifications (voltage or connector unidentifiable)'
    elif not eligible_parts:
        decision = 'escalate'
        reason = f'No catalogue parts match technical requirements ({v}V, {c}, {w}W min)'
    else:
        # Choose best candidate (exact watts match preferred, or first safe)
        chosen = eligible_parts[0]
        decision = 'dispatch'
        assigned_part_id = chosen['part_id']
        reason = f"Compatible candidate {chosen['part_id']} ({chosen['voltage']}V, {chosen['connector']}, {chosen['watts']}W)"

    return {
        'input_text': custom_text,
        'extracted': {
            'voltage': v,
            'connector': c,
            'watts': w,
            'safe_20w_applied': w is None and v is not None and c is not None,
        },
        'candidates': candidates,
        'decision': decision,
        'assigned_part_id': assigned_part_id,
        'decision_reason': reason,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', default='practice.json')
    parser.add_argument('--index', type=int, default=0)
    parser.add_argument('--text', default='Need a 5V USB-C charger for inspection camera, min 20W')
    parser.add_argument('--v', type=int, default=None)
    parser.add_argument('--c', type=str, default=None)
    parser.add_argument('--w', type=int, default=None)
    args = parser.parse_args()

    result = evaluate_custom_request(
        args.dataset,
        args.index,
        args.text,
        override_v=args.v,
        override_c=args.c,
        override_w=args.w,
    )
    print(json.dumps(result, indent=2))
