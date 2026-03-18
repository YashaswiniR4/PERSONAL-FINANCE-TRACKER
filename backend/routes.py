from fastapi import APIRouter, HTTPException
from db import db
from models import User, Transaction
from auth import hash_password, verify_password, create_token

router = APIRouter()

# REGISTER
@router.post("/register")
def register(user: User):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(400, "User already exists")

    db.users.insert_one({
        "email": user.email,
        "password": hash_password(user.password)
    })

    return {"msg": "User created"}

# LOGIN
@router.post("/login")
def login(user: User):
    db_user = db.users.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(400, "Invalid credentials")

    token = create_token({"email": user.email})

    return {"token": token}

# ADD TRANSACTION
@router.post("/add")
def add_transaction(txn: Transaction):
    db.transactions.insert_one(txn.dict())
    return {"msg": "Transaction added"}

# GET ALL TRANSACTIONS
@router.get("/all")
def get_transactions():
    data = list(db.transactions.find({}, {"_id": 0}))
    return data