from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime

from database import Base

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    jira_projects = Column(String) # Comma-separated

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    manager_id = Column(Integer)

class MetricDefinition(Base):
    __tablename__ = "metric_definitions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # "AUTOMATED" or "MANUAL"
    implementation_key = Column(String, nullable=True) # e.g., "JiraStoryPointProvider"
    weight = Column(Float, default=1.0)

class MetricThresholds(Base):
    __tablename__ = "metric_thresholds"
    id = Column(Integer, primary_key=True, index=True)
    metric_id = Column(Integer, ForeignKey("metric_definitions.id"))
    value_less_than = Column(Float, nullable=True)
    value_greater_than = Column(Float, nullable=True)
    score = Column(Integer) # 1-5

class ScoreEntry(Base):
    __tablename__ = "score_entries"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    metric_id = Column(Integer, ForeignKey("metric_definitions.id"))
    raw_value = Column(Float, nullable=True)
    calculated_score = Column(Integer) # 1-5
    remarks = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee")
    metric = relationship("MetricDefinition")
