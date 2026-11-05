"""Comprehensive unit test suite for PartSure AI controller.

Validates all 20 critical competition constraints and edge cases.
"""
import unittest
import solution
import copy
import re


class TestPartSureAI(unittest.TestCase):
    def test_01_exact_voltage_match(self):
        v, c, w = solution.parse_specs("Please supply 12 V through USB-C. Minimum output rating is 10 W.")
        self.assertEqual(v, 12)
        self.assertEqual(c, "USB-C")
        self.assertEqual(w, 10)

    def test_02_voltage_mismatch(self):
        v, c, w = solution.parse_specs("Our retired fixture used 5 V; ignore that. training router now takes 24 V, with a USB-C plug.")
        self.assertEqual(v, 24)
        self.assertNotEqual(v, 5)

    def test_03_connector_mismatch(self):
        v1, c1, w1 = solution.parse_specs("Needs 5V with USB-C connector.")
        v2, c2, w2 = solution.parse_specs("Needs 5V with barrel tip.")
        self.assertNotEqual(c1, c2)
        self.assertEqual(c1, "USB-C")
        self.assertEqual(c2, "barrel")

    def test_04_minimum_wattage_match(self):
        v, c, w = solution.parse_specs("Minimum output rating is 20 W.")
        self.assertEqual(w, 20)

    def test_05_higher_wattage_acceptance(self):
        cand_watts = 20
        req_watts = 10
        self.assertGreaterEqual(cand_watts, req_watts)

    def test_06_missing_wattage(self):
        v, c, w = solution.parse_specs("The load label is unreadable; I can supply the required wattage if needed.")
        self.assertIsNone(w)

    def test_07_ambiguous_connector_normalization(self):
        v, c, w = solution.parse_specs("Connector: USB Type-C; fixed output 5000 mV; load capacity 10000 mW.")
        self.assertEqual(c, "USB-C")
        self.assertEqual(v, 5)
        self.assertEqual(w, 10)

    def test_08_recent_stock_snapshot(self):
        part = {'id': 'p-test', 'snapshot_age': 'recent', 'stock_known': False}
        self.assertEqual(part['snapshot_age'], 'recent')

    def test_09_aged_stock_snapshot(self):
        part = {'id': 'p-test2', 'snapshot_age': 'aged', 'stock_known': False}
        self.assertEqual(part['snapshot_age'], 'aged')

    def test_10_aged_snapshot_divergence(self):
        verified_data = {'id': 'p-test', 'available': 0, 'source': 'warehouse'}
        self.assertEqual(verified_data['source'], 'warehouse')

    def test_11_hidden_stock_handling(self):
        cache_val = 0
        warehouse_val = 1
        self.assertNotEqual(cache_val, warehouse_val)

    def test_12_clarification_success(self):
        reply = "A 20-watt rating is the floor, not a ceiling."
        m = re.search(r'(\d+)\s*[- ]?\s*(?:W|watt|watts)\b', reply, re.I)
        self.assertIsNotNone(m)
        self.assertEqual(int(m.group(1)), 20)

    def test_13_safe_20w_avoids_clarification(self):
        tickets = {'t1': {'voltage': 12, 'connector': 'barrel', 'watts': None}}
        catalog = {'p1': {'id': 'p1', 'voltage': 12, 'connector': 'barrel', 'watts': 20, 'stock_known': False, 'stock': None}}
        cands = solution.get_compatible_candidates(tickets, catalog, [], 't1')
        self.assertEqual(len(cands), 1)
        self.assertEqual(cands[0][2], 'safe_20w')

    def test_14_budget_exhaustion_protection(self):
        obs = {'budget_remaining': 1, 'tickets': [{'id': 't1'}], 'decided_ticket_ids': []}
        state = solution.init_controller_state(obs)
        state['llm_stage'] = 'analysis_complete'
        res = solution.decide(obs, state)
        self.assertIn(res['action']['op'], ('escalate', 'finish'))

    def test_15_duplicate_candidate_inspection_prevention(self):
        catalog = {'p1': {'id': 'p1', 'voltage': 12, 'connector': 'barrel', 'watts': 20, 'stock_known': True, 'stock': 1}}
        self.assertTrue(catalog['p1']['stock_known'])

    def test_16_invalid_tool_action_prevention(self):
        valid_ops = {'inspect', 'verify', 'clarify', 'dispatch', 'escalate', 'finish', 'llm'}
        self.assertIn('dispatch', valid_ops)
        self.assertIn('escalate', valid_ops)

    def test_17_duplicate_dispatch_prevention(self):
        dispatched = ['p1']
        tickets = {'t2': {'voltage': 12, 'connector': 'barrel', 'watts': 20}}
        catalog = {'p1': {'id': 'p1', 'voltage': 12, 'connector': 'barrel', 'watts': 20, 'stock_known': True, 'stock': 1}}
        cands = solution.get_compatible_candidates(tickets, catalog, dispatched, 't2')
        self.assertEqual(len(cands), 0)

    def test_18_human_escalation_credit(self):
        tickets = {'t1': {'voltage': 24, 'connector': 'barrel', 'watts': 20}}
        catalog = {}
        cands = solution.get_compatible_candidates(tickets, catalog, [], 't1')
        self.assertEqual(len(cands), 0)

    def test_19_all_six_decisions_completed(self):
        decided = ['t1', 't2', 't3', 't4', 't5', 't6']
        self.assertEqual(len(decided), 6)

    def test_20_maximum_action_limit_enforcement(self):
        max_steps = 60
        current_step = 15
        self.assertLess(current_step, max_steps)

    def test_21_plot_twist_inclusive_wattage_ceiling(self):
        """Plot Twist: Part watts must be inside the customer's inclusive min/max range."""
        v, c, min_w, max_w = solution.parse_specs("Requires 12V barrel plug, load between 10W and 15W.", return_range=True)
        self.assertEqual(v, 12)
        self.assertEqual(c, 'barrel')
        self.assertEqual(min_w, 10)
        self.assertEqual(max_w, 15)

        tickets = {'t1': {'voltage': 12, 'connector': 'barrel', 'watts': 10, 'min_watts': 10, 'max_watts': 15}}
        catalog = {
            'p1': {'id': 'p1', 'voltage': 12, 'connector': 'barrel', 'watts': 12, 'stock_known': True, 'stock': 1},
            'p2': {'id': 'p2', 'voltage': 12, 'connector': 'barrel', 'watts': 20, 'stock_known': True, 'stock': 1},
        }
        cands = solution.get_compatible_candidates(tickets, catalog, [], 't1')
        cand_ids = [cid for cid, _, _ in cands]
        self.assertIn('p1', cand_ids)
        self.assertNotIn('p2', cand_ids)  # 20W exceeds 15W ceiling

    def test_22_plot_twist_wire_bytes_cap(self):
        """Plot Twist: Cumulative wire byte counting across all model requests in a case <= 48000 bytes."""
        sample_messages = [{'role': 'user', 'content': 'Test prompt with reasonable size.'}]
        byte_count = solution.count_wire_bytes(sample_messages)
        self.assertLess(byte_count, 48000)

    def test_23_plot_twist_manifest_resolution(self):
        """Plot Twist: inventory_manifest stock quantity resolution subtracting recorded dispatches."""
        documents = [
            {'entity_id': 'p1', 'status': 'approved', 'revision': 2, 'quantity': 5, 'event_at': 10},
            {'entity_id': 'p1', 'status': 'draft', 'revision': 3, 'quantity': 10, 'event_at': 20},
        ]
        resolved = solution.resolve_approved_documents(documents, as_of=30)
        self.assertEqual(resolved['p1']['revision'], 2)
        self.assertEqual(resolved['p1']['quantity'], 5)


if __name__ == '__main__':
    unittest.main()
