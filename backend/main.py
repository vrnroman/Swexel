from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import datetime

import models
from database import engine, get_db
from scheduler import start_scheduler
from providers import sync_automated_metrics

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = start_scheduler()

# Pydantic Schemas
class EmployeeBase(BaseModel):
    name: str
    jira_projects: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    class Config:
        orm_mode = True

class TeamBase(BaseModel):
    name: str
    manager_id: int

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int
    class Config:
        orm_mode = True

class MetricDefinitionBase(BaseModel):
    name: str
    type: str
    implementation_key: str | None = None
    weight: float

class MetricDefinitionCreate(MetricDefinitionBase):
    pass

class MetricDefinition(MetricDefinitionBase):
    id: int
    class Config:
        orm_mode = True

class MetricThresholdsBase(BaseModel):
    metric_id: int
    value_less_than: float | None = None
    value_greater_than: float | None = None
    score: int

class MetricThresholdsCreate(MetricThresholdsBase):
    pass

class MetricThresholds(MetricThresholdsBase):
    id: int
    class Config:
        orm_mode = True

class ScoreEntryBase(BaseModel):
    employee_id: int
    metric_id: int
    raw_value: float | None = None
    calculated_score: int
    remarks: str | None = None

class ScoreEntryCreate(ScoreEntryBase):
    pass

class ScoreEntry(ScoreEntryBase):
    id: int
    timestamp: datetime.datetime
    class Config:
        orm_mode = True

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Performance Management Portal API"}

@app.post("/api/sync")
def trigger_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(sync_automated_metrics, db)
    return {"message": "Sync started"}

# Employee Endpoints
@app.get("/api/employees", response_model=List[Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = db.query(models.Employee).offset(skip).limit(limit).all()
    return employees

@app.post("/api/employees", response_model=Employee)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = models.Employee(name=employee.name, jira_projects=employee.jira_projects)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

# Team Endpoints
@app.get("/api/teams", response_model=List[Team])
def read_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    teams = db.query(models.Team).offset(skip).limit(limit).all()
    return teams

@app.post("/api/teams", response_model=Team)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    db_team = models.Team(name=team.name, manager_id=team.manager_id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

# Metric Definitions Endpoints
@app.get("/api/metrics", response_model=List[MetricDefinition])
def read_metrics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    metrics = db.query(models.MetricDefinition).offset(skip).limit(limit).all()
    return metrics

@app.post("/api/metrics", response_model=MetricDefinition)
def create_metric(metric: MetricDefinitionCreate, db: Session = Depends(get_db)):
    db_metric = models.MetricDefinition(name=metric.name, type=metric.type, implementation_key=metric.implementation_key, weight=metric.weight)
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

# Metric Thresholds Endpoints
@app.get("/api/thresholds", response_model=List[MetricThresholds])
def read_thresholds(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    thresholds = db.query(models.MetricThresholds).offset(skip).limit(limit).all()
    return thresholds

@app.post("/api/thresholds", response_model=MetricThresholds)
def create_threshold(threshold: MetricThresholdsCreate, db: Session = Depends(get_db)):
    db_threshold = models.MetricThresholds(metric_id=threshold.metric_id, value_less_than=threshold.value_less_than, value_greater_than=threshold.value_greater_than, score=threshold.score)
    db.add(db_threshold)
    db.commit()
    db.refresh(db_threshold)
    return db_threshold

# Score Entry Endpoints
@app.get("/api/scores", response_model=List[ScoreEntry])
def read_scores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scores = db.query(models.ScoreEntry).offset(skip).limit(limit).all()
    return scores

@app.get("/api/scores/employee/{employee_id}", response_model=List[ScoreEntry])
def read_scores_by_employee(employee_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scores = db.query(models.ScoreEntry).filter(models.ScoreEntry.employee_id == employee_id).offset(skip).limit(limit).all()
    return scores

@app.post("/api/scores", response_model=ScoreEntry)
def create_score(score: ScoreEntryCreate, db: Session = Depends(get_db)):
    db_score = models.ScoreEntry(employee_id=score.employee_id, metric_id=score.metric_id, raw_value=score.raw_value, calculated_score=score.calculated_score, remarks=score.remarks)
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

@app.get("/api/reports/ranking")
def read_ranking_report(db: Session = Depends(get_db)):
    # Calculates the weighted average score of all people
    employees = db.query(models.Employee).all()
    metrics = db.query(models.MetricDefinition).all()

    ranking = []

    for emp in employees:
        scores = db.query(models.ScoreEntry).filter(models.ScoreEntry.employee_id == emp.id).all()
        total_weight = sum([m.weight for m in metrics])

        weighted_score = 0
        score_details = []
        for metric in metrics:
            metric_scores = [s for s in scores if s.metric_id == metric.id]
            if metric_scores:
                # get latest score
                latest_score = max(metric_scores, key=lambda s: s.timestamp)
                weighted_score += (latest_score.calculated_score * metric.weight)
                score_details.append({
                    "metric_id": metric.id,
                    "metric_name": metric.name,
                    "score": latest_score.calculated_score,
                    "raw_value": latest_score.raw_value,
                    "weight": metric.weight,
                })

        if total_weight > 0:
            final_score = weighted_score / total_weight
        else:
            final_score = 0

        ranking.append({
            "employee_id": emp.id,
            "employee_name": emp.name,
            "weighted_average_score": round(final_score, 2),
            "score_details": score_details
        })

    # Sort descending by default
    ranking.sort(key=lambda x: x["weighted_average_score"], reverse=True)
    return ranking
