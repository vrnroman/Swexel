from fastapi.testclient import TestClient
from main import app, get_db
import pytest

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Performance Management Portal API"}

def test_create_employee():
    response = client.post(
        "/api/employees",
        json={"name": "Test Employee", "jira_projects": "TEST"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Employee"
    assert response.json()["jira_projects"] == "TEST"

def test_create_team():
    response = client.post(
        "/api/teams",
        json={"name": "Test Team", "manager_id": 1}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Team"
    assert response.json()["manager_id"] == 1

def test_read_employees():
    response = client.get("/api/employees")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_read_teams():
    response = client.get("/api/teams")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
