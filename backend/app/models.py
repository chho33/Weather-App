from sqlalchemy import Table, Column, DateTime, Integer, String
from .database import metadata, engine


APIRecords = Table(
    "api_records",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("method", String),
    Column("api", String),
    Column("query_params", String),
    Column("client_host", String),
    Column("client_port", Integer),
    Column("status_code", Integer),
    Column("timestamp", DateTime)
)


metadata.create_all(engine)