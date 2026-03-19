from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from bson import ObjectId
import uuid

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

# ---------------- MODELS ----------------
class User(BaseModel):
    email: EmailStr
    password: str

# ---------------- HELPER ----------------
def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ---------------- REGISTER ----------------
@app.post("/register")
def register(user: User):

    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    token = str(uuid.uuid4())

    new_user = {
        "email": user.email,
        "password": user.password,
        "user_id": str(uuid.uuid4()),
        "verified": False,
        "verify_token": token
    }

    users_collection.insert_one(new_user)

    return {
        "msg": "Verification link generated",
        "verify_link": f"https://personal-finance-tracker-brown-nine.vercel.app/verify/{token}"
    }

# ---------------- VERIFY ----------------
@app.get("/verify/{token}")
def verify_email(token: str):

    user = users_collection.find_one({"verify_token": token})

    if not user:
        raise HTTPException(status_code=400, detail="Invalid link")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"verified": True}}
    )

    return {"msg": "Email verified successfully"}

# ---------------- LOGIN ----------------
@app.post("/login")
def login(user: User):

    db_user = users_collection.find_one({"email": user.email})

    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.get("verified"):
        raise HTTPException(status_code=403, detail="Please verify your email first")

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