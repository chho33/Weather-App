from datetime import datetime
import pytz
from fastapi import Request
from . import schemas


def epoch_to_date(epoch: int, timezone: str) -> str:
    return datetime.fromtimestamp(epoch, pytz.timezone(timezone)).strftime('%a %d')


def epoch_to_hour(epoch: int, timezone: str) -> str:
    return datetime.fromtimestamp(epoch, pytz.timezone(timezone)).strftime('%H %p')


def parse_request(request: Request, status_code: int) -> schemas.APIRecordCreate:
    return schemas.APIRecordCreate(
        method = str(request.method),
        api = str(request.url).split("?")[0],
        query_params = str(request.query_params),
        client_port = int(request.client.port),
        client_host = str(request.client.host),
        status_code = status_code,
        timestamp = datetime.now(tz=pytz.timezone("America/New_York"))
    )