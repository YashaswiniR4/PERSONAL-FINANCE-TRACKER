from pymongo import MongoClient

MONGO_URI = "mongodb+srv://finance_user:Finance123@cluster0.plyuuik.mongodb.net/finance_db?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client["finance_db"]