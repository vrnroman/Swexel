from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from database import SessionLocal
from providers import sync_automated_metrics
import logging

logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.DEBUG)

def _job_sync_metrics():
    db = SessionLocal()
    try:
        sync_automated_metrics(db)
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Run sync every 1 hour
    scheduler.add_job(_job_sync_metrics, 'interval', hours=1, id='sync_metrics_job', replace_existing=True)
    scheduler.start()
    return scheduler

def get_scheduler():
    return start_scheduler()
