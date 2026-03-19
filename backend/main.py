from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from bson import ObjectId
import uuid
import random

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DATABASE ----------------
client = MongoClient("mongodb+srv://finance_user:Finance123@cluster0.plyuuik.mongodb.net/finance_db?retryWrites=true&w=majority")
db = client["finance_db"]

transactions = db["transactions"]
users_collection = db["users"]

# ---------------- EMAIL CONFIG ----------------
import os

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),  # 🔥 MUST
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# ---------------- MODELS ----------------
class User(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    email: EmailStr

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str

# ---------------- HELPER ----------------
def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ---------------- OTP STORAGE ----------------
otp_storage = {}

# ---------------- SEND OTP ----------------
import os
import requests

@app.post("/send-otp")
def send_otp(data: OTPRequest):

    email = data.email.strip().lower()
    otp = str(random.randint(1000, 9999))
    otp_storage[email] = otp

    try:
        api_key = os.getenv("RESEND_API_KEY")
        print("API KEY:", api_key)  # DEBUG

        res = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "from": "onboarding@resend.dev",
                "to": email,
                "subject": "OTP Code",
                "html": f"<h1>Your OTP is {otp}</h1>"
            }
        )

        print("STATUS:", res.status_code)
        print("RESPONSE:", res.text)

        return {"msg": "OTP sent"}

    except Exception as e:
        print("❌ ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- REGISTER ----------------
@app.post("/register")
def register(user: User):

    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = {
        "email": user.email,
        "password": user.password,
        "user_id": str(uuid.uuid4())
    }

    users_collection.insert_one(new_user)

    return {"msg": "User registered successfully"}

# ---------------- LOGIN ----------------
@app.post("/login")
def login(user: User):

    db_user = users_collection.find_one({"email": user.email})

    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "token": "dummy_token",
        "user_id": db_user["user_id"],
        "email": db_user["email"]
    }

# ---------------- ADD ----------------
@app.post("/add")
def add_transaction(data: dict):

    if "user_id" not in data:
        raise HTTPException(status_code=400, detail="User ID missing")

    result = transactions.insert_one(data)
    return {"msg": "Added", "id": str(result.inserted_id)}

# ---------------- GET ----------------
@app.get("/all/{user_id}")
def get_all(user_id: str):

    data = list(transactions.find({"user_id": user_id}))
    return [serialize(d) for d in data]

# ---------------- DELETE ----------------
@app.delete("/delete/{id}")
def delete_transaction(id: str):

    transactions.delete_one({"_id": ObjectId(id)})
    return {"msg": "Deleted"}

# ---------------- UPDATE ----------------
@app.put("/update/{id}")
def update_transaction(id: str, data: dict):

    transactions.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    return {"msg": "Updated"}    