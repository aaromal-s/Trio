"""
TRIO Database Layer — SQLite (development) / PostgreSQL (production)
Provides a unified interface with automatic dialect detection and migration.
"""

import os
import sqlite3
import time
import uuid
import logging
from typing import Optional, Dict, Any, List, Tuple
from contextlib import contextmanager

logger = logging.getLogger("trio.database")

# ---------------------------------------------------------------------------
# Dialect helpers
# ---------------------------------------------------------------------------

def _get_database_url() -> str:
    """Return DATABASE_URL from env, defaulting to local SQLite."""
    return os.environ.get("DATABASE_URL", "sqlite:///trio.db")


def _is_postgres(url: str) -> bool:
    return url.startswith("postgres")


def _sqlite_path(url: str) -> str:
    """Extract the file path from a sqlite:/// URL."""
    return url.replace("sqlite:///", "")


# ---------------------------------------------------------------------------
# SQL dialect translation
# ---------------------------------------------------------------------------

def _translate_sql(sql: str, is_pg: bool) -> str:
    """Translate SQL placeholders and keywords between SQLite and PostgreSQL."""
    if is_pg:
        # SQLite uses ? placeholders; PostgreSQL uses %s
        sql = sql.replace("?", "%s")
        # SQLite AUTOINCREMENT → PostgreSQL SERIAL
        sql = sql.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
        # ON CONFLICT syntax adjustment handled case-by-case
    return sql


# ---------------------------------------------------------------------------
# Connection management
# ---------------------------------------------------------------------------

_pg_pool = None


def _get_pg_pool():
    """Lazy-initialize a psycopg2 connection pool."""
    global _pg_pool
    if _pg_pool is None:
        try:
            import psycopg2
            from psycopg2 import pool as pg_pool
            url = _get_database_url()
            _pg_pool = pg_pool.SimpleConnectionPool(1, 10, dsn=url)
            logger.info("PostgreSQL connection pool initialized.")
        except Exception as e:
            logger.error("Failed to create PostgreSQL pool: %s", e)
            raise
    return _pg_pool


@contextmanager
def get_connection():
    """Yield a DB-API 2.0 connection (SQLite or PostgreSQL)."""
    url = _get_database_url()
    if _is_postgres(url):
        pool = _get_pg_pool()
        conn = pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            pool.putconn(conn)
    else:
        path = _sqlite_path(url)
        conn = sqlite3.connect(path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()


# ---------------------------------------------------------------------------
# Schema migration
# ---------------------------------------------------------------------------

_TABLES_SQLITE = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'User',
    affiliation TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    account_type TEXT NOT NULL DEFAULT 'Standard',
    account_status TEXT NOT NULL DEFAULT 'Active',
    force_password_change INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_internal_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at REAL NOT NULL,
    FOREIGN KEY (user_internal_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reset_tokens (
    token_hash TEXT PRIMARY KEY,
    user_internal_id TEXT NOT NULL,
    created_at REAL NOT NULL,
    expires_at REAL NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_internal_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    uploaded_by TEXT,
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    is_simulated INTEGER NOT NULL DEFAULT 0,
    features_json TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS training_runs (
    id TEXT PRIMARY KEY,
    dataset_id TEXT,
    model_version TEXT NOT NULL,
    algorithm TEXT NOT NULL DEFAULT 'TRIO',
    weights_json TEXT DEFAULT '{}',
    metrics_json TEXT DEFAULT '{}',
    train_samples INTEGER NOT NULL DEFAULT 0,
    test_samples INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

CREATE TABLE IF NOT EXISTS discovery_candidates (
    candidate_id TEXT PRIMARY KEY,
    training_run_id TEXT,
    first_detected TEXT,
    last_detected TEXT,
    observation_count INTEGER NOT NULL DEFAULT 0,
    mean_score REAL NOT NULL DEFAULT 0.0,
    cluster_density REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Pending',
    explanation TEXT DEFAULT '',
    centroid_json TEXT DEFAULT '[]',
    feature_deltas_json TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY (training_run_id) REFERENCES training_runs(id)
);

CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_start REAL NOT NULL
);
"""

_TABLES_POSTGRES = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'User',
    affiliation TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    account_type TEXT NOT NULL DEFAULT 'Standard',
    account_status TEXT NOT NULL DEFAULT 'Active',
    force_password_change INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_internal_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS reset_tokens (
    token_hash TEXT PRIMARY KEY,
    user_internal_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at DOUBLE PRECISION NOT NULL,
    expires_at DOUBLE PRECISION NOT NULL,
    used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    uploaded_by TEXT REFERENCES users(id),
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    is_simulated INTEGER NOT NULL DEFAULT 0,
    features_json TEXT DEFAULT '[]',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_runs (
    id TEXT PRIMARY KEY,
    dataset_id TEXT REFERENCES datasets(id),
    model_version TEXT NOT NULL,
    algorithm TEXT NOT NULL DEFAULT 'TRIO',
    weights_json TEXT DEFAULT '{}',
    metrics_json TEXT DEFAULT '{}',
    train_samples INTEGER NOT NULL DEFAULT 0,
    test_samples INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS discovery_candidates (
    candidate_id TEXT PRIMARY KEY,
    training_run_id TEXT REFERENCES training_runs(id),
    first_detected TEXT,
    last_detected TEXT,
    observation_count INTEGER NOT NULL DEFAULT 0,
    mean_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cluster_density DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Pending',
    explanation TEXT DEFAULT '',
    centroid_json TEXT DEFAULT '[]',
    feature_deltas_json TEXT DEFAULT '{}',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_start DOUBLE PRECISION NOT NULL
);
"""


def run_migrations():
    """Create all tables if they don't exist."""
    url = _get_database_url()
    is_pg = _is_postgres(url)
    schema = _TABLES_POSTGRES if is_pg else _TABLES_SQLITE

    with get_connection() as conn:
        cur = conn.cursor()
        # Split on semicolons and run each statement
        for statement in schema.strip().split(";"):
            stmt = statement.strip()
            if stmt:
                cur.execute(stmt)
        # Safe migration for force_password_change on existing users table
        try:
            if is_pg:
                cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change INTEGER NOT NULL DEFAULT 0")
            else:
                cur.execute("ALTER TABLE users ADD COLUMN force_password_change INTEGER NOT NULL DEFAULT 0")
        except Exception:
            pass  # Already exists
        logger.info("Database migrations completed (%s).", "PostgreSQL" if is_pg else "SQLite")


# ---------------------------------------------------------------------------
# CRUD helpers
# ---------------------------------------------------------------------------

def _ph(n: int) -> str:
    """Generate n placeholders for the current dialect."""
    url = _get_database_url()
    if _is_postgres(url):
        return ", ".join(["%s"] * n)
    return ", ".join(["?"] * n)


def _phk() -> str:
    """Return single placeholder for current dialect."""
    url = _get_database_url()
    return "%s" if _is_postgres(url) else "?"


def execute_query(sql: str, params: tuple = (), fetch: str = "all") -> Any:
    """
    Execute a SQL query with automatic dialect translation.
    fetch: 'all', 'one', 'none'
    """
    url = _get_database_url()
    is_pg = _is_postgres(url)

    if is_pg and "?" in sql:
        sql = sql.replace("?", "%s")

    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        if fetch == "all":
            rows = cur.fetchall()
            if is_pg:
                cols = [desc[0] for desc in cur.description] if cur.description else []
                return [dict(zip(cols, row)) for row in rows]
            return [dict(row) for row in rows]
        elif fetch == "one":
            row = cur.fetchone()
            if row is None:
                return None
            if is_pg:
                cols = [desc[0] for desc in cur.description] if cur.description else []
                return dict(zip(cols, row))
            return dict(row)
        return None


def execute_write(sql: str, params: tuple = ()) -> int:
    """Execute an INSERT/UPDATE/DELETE and return rowcount."""
    url = _get_database_url()
    is_pg = _is_postgres(url)

    if is_pg and "?" in sql:
        sql = sql.replace("?", "%s")

    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return cur.rowcount


# ---------------------------------------------------------------------------
# Seed default users
# ---------------------------------------------------------------------------

def seed_default_users(hash_fn):
    """
    Insert default demo users if they don't exist.
    DEMO ACCOUNTS ARE STRICTLY DISABLED IN PRODUCTION ENVIRONMENTS.
    """
    is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"
    allow_demo = os.environ.get("ALLOW_DEMO_ACCOUNTS", "false").lower() == "true"

    if is_production and not allow_demo:
        # In production, ensure any existing demo accounts are deactivated
        try:
            execute_write(
                "UPDATE users SET account_status = 'Disabled' WHERE LOWER(user_id) IN ('evaluator', 'guest')"
            )
            logger.info("Production mode: Demo accounts are strictly disabled.")
        except Exception as e:
            logger.debug("Demo accounts check: %s", e)
        return

    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    defaults = [
        {
            "id": "INTERNAL-001",
            "user_id": "evaluator",
            "name": "Dr. Sarah Chen",
            "email": "evaluator@university.edu",
            "role": "Principal AI/ML Evaluator",
            "affiliation": "Department of Computer Science & Automation",
            "password_hash": hash_fn("trio2026demo"),
            "account_type": "Evaluator",
            "account_status": "Active",
            "created_at": "2026-11-01T10:00:00",
            "updated_at": now,
        },
        {
            "id": "INTERNAL-002",
            "user_id": "guest",
            "name": "Demo Guest Evaluator",
            "email": "guest.evaluator@university.edu",
            "role": "Visiting Defense Committee Member",
            "affiliation": "University AI Evaluation Sandbox",
            "password_hash": hash_fn("guest123"),
            "account_type": "Guest",
            "account_status": "Active",
            "created_at": "2026-11-08T12:00:00",
            "updated_at": now,
        },
    ]

    url = _get_database_url()
    is_pg = _is_postgres(url)

    for u in defaults:
        if is_pg:
            sql = """
                INSERT INTO users (id, user_id, name, email, role, affiliation,
                                   password_hash, account_type, account_status,
                                   created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id) DO NOTHING
            """
        else:
            sql = """
                INSERT OR IGNORE INTO users (id, user_id, name, email, role, affiliation,
                                             password_hash, account_type, account_status,
                                             created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
        execute_write(sql, (
            u["id"], u["user_id"], u["name"], u["email"], u["role"],
            u["affiliation"], u["password_hash"], u["account_type"],
            u["account_status"], u["created_at"], u["updated_at"]
        ))

    logger.info("Default users seeded.")


def seed_bootstrap_admin(hash_fn):
    """
    Idempotently bootstrap the master administrator account.
    User ID: 12406834
    Temporary Password: hash_fn("123456")
    Force password change on first login: True
    If this account already exists, its password is NOT overwritten.
    """
    admin_uid = "12406834"
    existing = execute_query(
        "SELECT id, force_password_change FROM users WHERE LOWER(user_id) = ?",
        (admin_uid.lower(),),
        fetch="one"
    )
    if existing:
        logger.info("Bootstrap administrator account '%s' already exists.", admin_uid)
        return

    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    internal_id = "USR-ADMIN-12406834"
    temp_pass_hash = hash_fn("123456")
    
    url = _get_database_url()
    is_pg = _is_postgres(url)
    
    if is_pg:
        sql = """
            INSERT INTO users (id, user_id, name, email, role, affiliation,
                               password_hash, avatar_url, account_type, account_status,
                               force_password_change, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO NOTHING
        """
    else:
        sql = """
            INSERT OR IGNORE INTO users (id, user_id, name, email, role, affiliation,
                                         password_hash, avatar_url, account_type, account_status,
                                         force_password_change, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
    execute_write(sql, (
        internal_id, admin_uid, "Lead System Administrator", "admin.12406834@trio-ai.internal",
        "Lead System Architect", "TRIO Platform Infrastructure", temp_pass_hash,
        "", "Administrator", "Active", 1, now, now
    ))
    logger.info("Bootstrap administrator account '%s' successfully provisioned.", admin_uid)


# ---------------------------------------------------------------------------
# SQLite to PostgreSQL Migration Utility
# ---------------------------------------------------------------------------

def migrate_sqlite_to_postgres(sqlite_path: str, pg_url: str) -> Dict[str, Any]:
    """
    Migrates all data from an existing SQLite database file to a PostgreSQL database.
    Preserves all 7 tables, maintains foreign-key relationships, detects and reports
    conflicting records, and verifies target row counts before and after migration.
    """
    import psycopg2
    from psycopg2.extras import execute_batch

    if not os.path.isfile(sqlite_path):
        raise FileNotFoundError(f"Source SQLite database file not found at: {sqlite_path}")

    tables_ordered = [
        "users",
        "datasets",
        "training_runs",
        "discovery_candidates",
        "sessions",
        "reset_tokens",
        "rate_limits"
    ]

    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    pg_conn = psycopg2.connect(pg_url)

    migration_report: Dict[str, Any] = {
        "status": "CLEAN_MIGRATION",
        "tables": {},
        "total_source_rows": 0,
        "total_inserted": 0,
        "total_conflicts": 0,
        "discrepancies_detected": False
    }

    try:
        # Step 1: Ensure PostgreSQL schema exists
        with pg_conn.cursor() as cur:
            for statement in _TABLES_POSTGRES.strip().split(";"):
                stmt = statement.strip()
                if stmt:
                    cur.execute(stmt)
        pg_conn.commit()

        # Step 2: Migrate table by table with conflict detection
        with pg_conn.cursor() as cur:
            for table in tables_ordered:
                # Count in PG before migration
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                pg_before = cur.fetchone()[0]

                # Read from SQLite
                s_cur = sqlite_conn.cursor()
                s_cur.execute(f"SELECT * FROM {table}")
                rows = s_cur.fetchall()
                count_sqlite = len(rows)

                table_conflicts = []
                non_conflicting_rows = []

                pk = "key" if table == "rate_limits" else (
                    "token_hash" if table == "reset_tokens" else (
                        "token" if table == "sessions" else (
                            "candidate_id" if table == "discovery_candidates" else "id"
                        )
                    )
                )

                if count_sqlite > 0:
                    col_names = [col[0] for col in s_cur.description]
                    cols_str = ", ".join(col_names)
                    placeholders = ", ".join(["%s"] * len(col_names))

                    # Fetch existing primary keys in target PostgreSQL
                    cur.execute(f"SELECT {pk} FROM {table}")
                    existing_pks = {r[0] for r in cur.fetchall()}

                    # For users table, also fetch existing user_id and email
                    existing_user_ids = set()
                    existing_emails = set()
                    if table == "users":
                        cur.execute("SELECT user_id, email FROM users")
                        for u_row in cur.fetchall():
                            if u_row[0]:
                                existing_user_ids.add(u_row[0].lower())
                            if u_row[1]:
                                existing_emails.add(u_row[1].lower())

                    for r in rows:
                        row_pk = r[pk]
                        conflict_reasons = []

                        if row_pk in existing_pks:
                            conflict_reasons.append(f"Primary key '{row_pk}' already exists in target table '{table}'")

                        if table == "users":
                            u_val = str(r["user_id"]).lower() if "user_id" in col_names else ""
                            e_val = str(r["email"]).lower() if "email" in col_names else ""
                            if u_val in existing_user_ids and row_pk not in existing_pks:
                                conflict_reasons.append(f"Unique User ID '{u_val}' already exists in target table")
                            if e_val in existing_emails and row_pk not in existing_pks:
                                conflict_reasons.append(f"Unique Email '{e_val}' already exists in target table")

                        if conflict_reasons:
                            table_conflicts.append({
                                "key": str(row_pk),
                                "reasons": conflict_reasons,
                                "action": "skipped_to_prevent_overwrite"
                            })
                        else:
                            non_conflicting_rows.append(tuple(r[col] for col in col_names))
                            existing_pks.add(row_pk)
                            if table == "users":
                                existing_user_ids.add(str(r["user_id"]).lower())
                                existing_emails.add(str(r["email"]).lower())

                    # Insert non-conflicting rows in batch
                    if non_conflicting_rows:
                        insert_sql = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders})"
                        execute_batch(cur, insert_sql, non_conflicting_rows, page_size=200)

                # Count in PG after migration
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                pg_after = cur.fetchone()[0]
                actual_inserted = pg_after - pg_before

                # Verify count arithmetic
                count_matches = (count_sqlite == actual_inserted + len(table_conflicts))
                if not count_matches:
                    migration_report["discrepancies_detected"] = True

                migration_report["tables"][table] = {
                    "source_sqlite_count": count_sqlite,
                    "target_pg_before": pg_before,
                    "inserted_count": actual_inserted,
                    "conflict_count": len(table_conflicts),
                    "conflicts": table_conflicts,
                    "target_pg_after": pg_after,
                    "audit_status": "EXACT_MATCH" if count_matches else "COUNT_MISMATCH"
                }

                migration_report["total_source_rows"] += count_sqlite
                migration_report["total_inserted"] += actual_inserted
                migration_report["total_conflicts"] += len(table_conflicts)

        pg_conn.commit()

        if migration_report["discrepancies_detected"]:
            migration_report["status"] = "DISCREPANCY_DETECTED"
        elif migration_report["total_conflicts"] > 0:
            migration_report["status"] = "CONFLICTS_REPORTED_NO_OVERWRITE"
        else:
            migration_report["status"] = "CLEAN_MIGRATION"

        logger.info("SQLite to PostgreSQL migration completed: %s", migration_report)
        return migration_report

    except Exception as e:
        pg_conn.rollback()
        logger.error("Migration failed, transaction rolled back: %s", e)
        raise
    finally:
        sqlite_conn.close()
        pg_conn.close()


