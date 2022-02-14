from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
import databases


SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

database = databases.Database(SQLALCHEMY_DATABASE_URL)

metadata = MetaData()

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
