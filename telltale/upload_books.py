from pymongo import MongoClient
import pandas as pd

client = MongoClient("mongodb+srv://g25ramya_db_user:2gK913SgG5qvl7Nw@telltale.lh8mrsa.mongodb.net/telltale?retryWrites=true&w=majority&appName=telltale")
print("✅ Connected to MongoDB")

db = client["telltale"]
collection = db["books"]
collection.drop_index("isbn_1")

df = pd.read_csv("D:/TELLTALE PROJECT/ml/books_aligned.csv")
print("📊 CSV loaded:", df.shape)

data = df.to_dict(orient="records")

# Clear old data
collection.delete_many({})
print("🧹 Old data cleared")

result = collection.insert_many(data, ordered=False)

print(f"✅ Inserted {len(result.inserted_ids)} books")
print("🎉 DONE")