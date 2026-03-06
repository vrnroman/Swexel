import os
import requests
from typing import Dict, Any, List
import datetime
from sqlalchemy.orm import Session

from models import Employee, MetricDefinition, MetricThresholds, ScoreEntry

class BaseProvider:
    def fetch_data(self, employee: Employee) -> float:
        raise NotImplementedError

class JiraStoryPointProvider(BaseProvider):
    def fetch_data(self, employee: Employee) -> float:
        # Auth: Use Personal Access Token (PAT).
        pat = os.environ.get("JIRA_PAT", "mock_pat")
        jira_url = os.environ.get("JIRA_URL", "https://mock.jira.com")

        projects = employee.jira_projects
        if not projects:
            return 0.0

        projects_list = [p.strip() for p in projects.split(",")]
        projects_jql = ", ".join([f'"{p}"' for p in projects_list])
        jql = f'project IN ({projects_jql}) AND resolutiondate >= "-14d"'

        # Mock logic
        print(f"Executing JQL for {employee.name}: {jql}")
        # In a real scenario, this would be:
        # response = requests.get(f"{jira_url}/rest/api/2/search", params={"jql": jql}, headers={"Authorization": f"Bearer {pat}"})
        # return calculate_points(response.json())

        # Mocking some return value based on employee id
        return float(employee.id * 5)

def get_provider(implementation_key: str) -> BaseProvider:
    providers = {
        "JiraStoryPointProvider": JiraStoryPointProvider()
    }
    return providers.get(implementation_key)

def calculate_score(value: float, thresholds: List[MetricThresholds]) -> int:
    for threshold in thresholds:
        if threshold.value_less_than is not None and value < threshold.value_less_than:
            return threshold.score
        if threshold.value_greater_than is not None and value > threshold.value_greater_than:
            return threshold.score
    return 3 # Default score

def sync_automated_metrics(db: Session):
    print("Starting automated metrics sync...")

    # Get all automated metrics
    automated_metrics = db.query(MetricDefinition).filter(MetricDefinition.type == "AUTOMATED").all()
    employees = db.query(Employee).all()

    for metric in automated_metrics:
        provider = get_provider(metric.implementation_key)
        if not provider:
            print(f"Provider {metric.implementation_key} not found for metric {metric.name}")
            continue

        thresholds = db.query(MetricThresholds).filter(MetricThresholds.metric_id == metric.id).all()

        for employee in employees:
            try:
                raw_value = provider.fetch_data(employee)
                score = calculate_score(raw_value, thresholds)

                # Create a new score entry
                entry = ScoreEntry(
                    employee_id=employee.id,
                    metric_id=metric.id,
                    raw_value=raw_value,
                    calculated_score=score,
                    remarks=f"Automated sync via {metric.implementation_key}",
                    timestamp=datetime.datetime.utcnow()
                )
                db.add(entry)
            except Exception as e:
                print(f"Error fetching data for employee {employee.id} using {metric.implementation_key}: {e}")

    db.commit()
    print("Finished automated metrics sync.")
