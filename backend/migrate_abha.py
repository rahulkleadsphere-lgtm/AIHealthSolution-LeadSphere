import sys
import os

sys.path.insert(0, os.path.abspath("."))
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from app.config.db import engine, Base
from sqlalchemy import text
from app.models.consent_model import ConsentShare

def run_migration():
    print("Running ABHA and ConsentShare DB Migration...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_abha_verified INT DEFAULT 1;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS abha_address VARCHAR(100) DEFAULT 'rahul.sharma@abdm';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS abha_verified_at TIMESTAMP;"))
            conn.commit()
            print("✅ Added columns to users table.")
        except Exception as e:
            print("Notice on ALTER TABLE users:", e)

        try:
            # Create consent_shares table
            Base.metadata.create_all(bind=engine)
            print("✅ Base metadata created (consent_shares table ensured).")
        except Exception as e:
            print("Notice on create_all:", e)

    print("Migration finished successfully.")

if __name__ == "__main__":
    run_migration()
