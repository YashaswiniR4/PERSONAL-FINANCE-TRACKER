from pydantic import BaseModel

class User(BaseModel):
    email: str
    password: str

class Transaction(BaseModel):
    amount: float
    category: str
    date: str
    note: str
    type: str  # income / expense