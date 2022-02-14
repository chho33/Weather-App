from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from ip2geotools.databases.noncommercial import DbIpCity
from typing import Optional, List
import configparser
import aiohttp
from .database import database
from . import models, schemas
from .utils import epoch_to_date, epoch_to_hour, parse_request


config = configparser.ConfigParser()
config.read("./config")
api_key = config["open_weather"]["key"]
api_version = config["open_weather"]["version"] 

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def api_recorder(request: Request, call_next):
    response = await call_next(request)
    api_record = parse_request(request, int(response.status_code))
    await create_api_record(api_record)
    return response


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.get("/api_record/", response_model=List[schemas.APIRecord])
async def read_api_records(limit: Optional[int] = 0, offset: Optional[int] = 0):
    query = models.APIRecords.select()
    if limit > 0:
        query = query.limit(limit)
    if offset:
        query = query.offset(offset)
    return await database.fetch_all(query)


@app.post("/api_record/", response_model=schemas.APIRecord)
async def create_api_record(api_record: schemas.APIRecordCreate):
    query = models.APIRecords.insert().values(**api_record.dict())
    last_record_id = await database.execute(query)
    print({**api_record.dict(), "id": last_record_id})
    return {**api_record.dict(), "id": last_record_id}


@app.get("/get_weather")
async def get_weather(request: Request, lat: Optional[str] = None, lon: Optional[str] = None,
        city: Optional[str] = None, country: Optional[str] = None):

    if not lat:
        client_host = request.client.host
        geo = DbIpCity.get(client_host, api_key='free')
        lat = geo.latitude
        lon = geo.longitude
        city = geo.city
        country = geo.country

    api = f"https://api.openweathermap.org/data/{api_version}/onecall?lat={lat}&lon={lon}&exclude=minutely,alert&appid={api_key}&units=imperial"
    async with aiohttp.ClientSession() as sess:
        async with sess.get(api) as res:
            res = await res.json()
    current, daily, hourly = res["current"], res["daily"], res["hourly"]

    return {
        "current": {
            "city": city,
            "country": country,
            "descrip": current["weather"][0]["main"],
            "temp": current["temp"],
            "feel": current["feels_like"],
            "wind": current["wind_speed"],
            "humid": current["humidity"],
            "icon": f'http://openweathermap.org/img/wn/{current["weather"][0]["icon"]}@2x.png'
        },
        "daily": [
            {
                "date": epoch_to_date(rec["dt"]),
                "tempMin": rec["temp"]["min"],
                "tempMax": rec["temp"]["max"],
                "icon": f'http://openweathermap.org/img/wn/{rec["weather"][0]["icon"]}@2x.png'
            } for rec in daily
        ],
        "hourly": [
            {
                "date": epoch_to_hour(rec["dt"]),
                "temp": rec["temp"],
                "pop": rec["pop"]
            } for rec in hourly[:24]
        ]
    }


@app.get("/get_cities/{query}")
async def get_cities(request: Request, query: str):
    
    api = f"https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={api_key}&units=imperial"
    async with aiohttp.ClientSession() as sess:
        async with sess.get(api) as res:
            res = await res.json()

    if not res:
        return [{"name": "No Valid City", "isDisabled": True, "lat": None, "lon": None, "city": None, "country": None}]

    ret = []
    for rec in res:
        name = rec["name"]
        if "state" in rec:
            name += f", {rec['state']}"
        if "country" in rec:
            name += f", {rec['country']}"
        ret.append({
            "name": name,
            "isDisabled": False,
            "lat": rec["lat"],
            "lon": rec["lon"],
            "city": rec["name"],
            "country": rec["country"]
        })

    return ret
