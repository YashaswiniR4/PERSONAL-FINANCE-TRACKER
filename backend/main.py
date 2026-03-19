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
@app.post("/send-otp")
async def send_otp(data: OTPRequest):
    try:
        email = data.email.strip().lower()

        otp = str(random.randint(1000, 9999))
        otp_storage[email] = otp

        message = MessageSchema(
            subject="Finance Tracker OTP",
            recipients=[email],
            body=f"Your OTP is {otp}",
            subtype="plain"
        )

        fm = FastMail(conf)
        await fm.send_message(message)

        print("✅ OTP SENT:", otp)

        # 🔥 RETURN OTP FOR DEBUG
        return {
            "msg": "OTP sent",
            "otp": otp   # 🔥 IMPORTANT
        }

    except Exception as e:
        print("❌ EMAIL ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to send OTP")

# ---------------- VERIFY OTP ----------------
@app.post("/verify-otp")
def verify_otp(data: VerifyOTP):

    email = data.email.strip().lower()
    entered_otp = data.otp.strip()

    stored_otp = otp_storage.get(email)

    print("Entered OTP:", entered_otp)
    print("Stored OTP:", stored_otp)
    print("Email:", email)

    if stored_otp and stored_otp == entered_otp:
        del otp_storage[email]  # 🔥 prevent reuse
        return {"msg": "OTP verified"}

    raise HTTPException(status_code=400, detail="Invalid OTP")

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