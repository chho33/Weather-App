from pydantic import BaseModel
from datetime import datetime


class APIRecordBase(BaseModel):
    method: str
    api: str
    query_params: str | None = None
    client_host: str
    client_port: int
    status_code: int
    timestamp: datetime


class APIRecordCreate(APIRecordBase):
    pass


class APIRecord(APIRecordBase):
    id: int

    class Config:
        orm_mode = True