"""
Tests for FastAPI HTTP Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["rules_count"] >= 20


def test_api_rules():
    response = client.get("/api/rules")
    assert response.status_code == 200
    data = response.json()
    assert "rules" in data
    assert len(data["rules"]) >= 20


def test_api_goals():
    response = client.get("/api/goals")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5


def test_api_demo_cases():
    response = client.get("/api/demo-cases")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8


def test_api_assess_forward():
    payload = {
        "mode": "forward",
        "egfr": 42.0,
        "uacr": 120.0,
        "chronicity_ge_3m": "yes",
        "diabetes": "yes",
        "hypertension": "yes"
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "forward"
    assert data["egfr_stage"] == "G3b"
    assert data["uacr_stage"] == "A2"
    assert data["kdigo_risk_category"] == "Very_High"
    assert data["assessment_summary"] == "Confirmed_CKD_Criteria_Met"
    assert len(data["rule_trace"]) > 0
    assert "safety_disclaimer" in data


def test_api_assess_backward():
    payload = {
        "mode": "backward",
        "egfr": 42.0,
        "uacr": 120.0,
        "chronicity_ge_3m": "yes",
        "target_fact": "assessment_summary",
        "target_value": "Confirmed_CKD_Criteria_Met"
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "backward"
    assert data["goal_status"] == "SUPPORTED"
    assert data["proof_tree"] is not None


def test_api_validation_error():
    # Negative eGFR should trigger validation error
    payload = {
        "mode": "forward",
        "egfr": -10.0,
        "uacr": 50.0
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 422
