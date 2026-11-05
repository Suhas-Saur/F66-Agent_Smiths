"""Runner script to execute a case with solution.py and export full structured trace for the dashboard."""
import argparse
import copy
import json
import re
import agentic_simulator as sim
import local_runner as lr
import solution


def run_case_trace(dataset_path='practice.json', case_index=0):
    with open(dataset_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if case_index >= len(data):
        case_index = 0

    record = data[case_index]
    case_world = record['world']
    as_of = record['observation'].get('as_of', 100)

    # Initialize simulation
    state, sim_obs = sim.start(case_world)
    ctrl_state = {}

    trace_steps = []
    model_calls = 0

    class MockProvider:
        mode = 'mock'

        def __init__(self):
            self.observation = {}

        def call(self, action):
            return {'text': json.dumps({'analysis': []}), 'usage': {'input_tokens': 120, 'output_tokens': 80}}

    prov = MockProvider()

    # Step through simulation
    while not state['done'] and state['steps'] < 60:
        proj_obs = lr.project_observation(record, sim_obs)
        prov.observation = proj_obs

        # Call controller decide
        res = solution.decide(proj_obs, ctrl_state)
        ctrl_state = res['state']
        action = res['action']

        if action.get('op') == 'llm':
            model_calls += 1
            # Mock or gateway call
            reply = prov.call(action)
            proj_obs['llm_response'] = reply['text']
            proj_obs['llm_usage'] = reply['usage']

            trace_steps.append({
                'step': state['steps'],
                'kind': 'llm',
                'action': action,
                'result': {'reply': reply['text'], 'usage': reply['usage']},
                'budget_remaining': 14 - state['spent'],
            })

            # Call decide again with llm response
            res = solution.decide(proj_obs, ctrl_state)
            ctrl_state = res['state']
            action = res['action']

        # Execute world step
        state, sim_obs, done = sim.step(case_world, state, action)

        trace_steps.append({
            'step': state['steps'],
            'kind': 'world_action',
            'action': action,
            'result': sim_obs.get('result'),
            'budget_remaining': 14 - state['spent'],
            'spent': state['spent'],
        })

    grade = sim.grade(case_world, state)

    # Compile candidate matching table for each ticket against all parts
    cat_items = ctrl_state.get('catalog', {})
    tickets_items = ctrl_state.get('tickets', {})

    # Enrich tickets with assigned part specifications
    for tid, t in tickets_items.items():
        assigned_p = cat_items.get(t.get('assigned_part_id'))
        if assigned_p:
            t['assigned_part_watts'] = assigned_p.get('watts')
            t['assigned_part_voltage'] = assigned_p.get('voltage')
            t['assigned_part_connector'] = assigned_p.get('connector')
        else:
            t['assigned_part_watts'] = None
            t['assigned_part_voltage'] = None
            t['assigned_part_connector'] = None

    # Enrich catalog items with desk cache, warehouse stock, and discrepancy status
    catalog_list = []
    for pid, p in cat_items.items():
        p_obj = dict(p)
        desk_val = case_world.get('cache', {}).get(pid)
        wh_val = case_world.get('stock', {}).get(pid)
        p_obj['desk_cache'] = desk_val
        p_obj['warehouse_stock'] = wh_val
        p_obj['has_discrepancy'] = bool(desk_val is not None and wh_val is not None and desk_val != wh_val)
        catalog_list.append(p_obj)

    compatibility_matrix = []
    for tid, t in tickets_items.items():
        row = {
            'ticket_id': tid,
            'req_v': t['voltage'],
            'req_c': t['connector'],
            'req_w': t['watts'],
            'clarified': t['clarified'],
            'clarification_reply': t.get('clarification_reply'),
            'decision': t.get('decision'),
            'assigned_part_id': t.get('assigned_part_id'),
            'decision_reason': t.get('decision_reason'),
            'candidates': [],
        }
        for pid, p in cat_items.items():
            v_match = p['voltage'] == t['voltage']
            c_match = p['connector'] == t['connector']
            w_match = False
            if t['watts'] is not None:
                w_match = p['watts'] >= t['watts']
            else:
                w_match = p['watts'] >= 20  # Safe 20W

            is_compat = v_match and c_match and w_match
            row['candidates'].append({
                'part_id': pid,
                'voltage': p['voltage'],
                'connector': p['connector'],
                'watts': p['watts'],
                'v_match': v_match,
                'c_match': c_match,
                'w_match': w_match,
                'compatible': is_compat,
                'stock_known': p['stock_known'],
                'stock': p['stock'],
                'snapshot_age': p['snapshot_age'],
            })
        compatibility_matrix.append(row)

    return {
        'case_id': case_world['case_id'],
        'case_index': case_index,
        'dataset': dataset_path,
        'condition': case_world.get('condition', 'ordinary'),
        'policy': record['observation'].get('policy', ''),
        'tickets': list(tickets_items.values()),
        'catalog': catalog_list,
        'compatibility_matrix': compatibility_matrix,
        'steps': trace_steps,
        'spent': state['spent'],
        'budget_remaining': 14 - state['spent'],
        'model_calls': model_calls,
        'grade': grade,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', default='practice.json')
    parser.add_argument('--index', type=int, default=0)
    args = parser.parse_args()

    trace = run_case_trace(args.dataset, args.index)
    print(json.dumps(trace, indent=2))
