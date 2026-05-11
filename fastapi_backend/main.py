import os
from contextlib import asynccontextmanager
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "studentresourcesharing")

client = None
db = None
users_collection = None
materials_collection = None


# ================= MODELS ================= #

class SignupRequest(BaseModel):
    fullName: str
    email: EmailStr
    phone: str | None = ""
    password: str


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class AddUserRequest(BaseModel):
    fullName: str
    email: EmailStr
    phone: str | None = ""
    password: str
    role: str = "user"
    status: str = "active"


class UpdateUserRequest(BaseModel):
    fullName: str
    email: EmailStr
    phone: str | None = ""
    role: str
    status: str


class MaterialRequest(BaseModel):
    title: str
    description: str
    subject: str
    semester: str
    tags: list[str]
    uploadedBy: str


class UpdateMaterialRequest(BaseModel):
    title: str
    description: str
    subject: str
    semester: str
    tags: list[str]

# ================= DATABASE ================= #

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, users_collection, materials_collection

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]

    users_collection = db["users"]
    materials_collection = db["materials"]

    print("MongoDB Connected ✅")

    yield

    if client:
        client.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= ROOT ================= #

@app.get("/")
async def root():
    return {"message": "FastAPI server running"}


# ================= AUTH ================= #

@app.post("/signup")
async def signup(data: SignupRequest):
    if not data.fullName.strip() or not data.password.strip():
        raise HTTPException(status_code=400, detail="Missing fields")

    existing_user = users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = {
        "fullName": data.fullName,
        "email": data.email,
        "phone": data.phone,
        "password": data.password,
        "role": "user",
        "status": "active"
    }

    users_collection.insert_one(new_user)

    return {"message": "User saved successfully"}


@app.post("/signin")
async def signin(data: SigninRequest):
    user = users_collection.find_one({
        "email": data.email,
        "password": data.password
    })

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Signin successful",
        "user": {
            "fullName": user["fullName"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "status": user.get("status", "active")
        }
    }


@app.post("/admin/signin")
async def admin_signin(data: SigninRequest):
    user = users_collection.find_one({
        "email": data.email,
        "password": data.password
    })

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin only.")

    return {
        "message": "Admin signin successful",
        "user": {
            "fullName": user["fullName"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "status": user.get("status", "active")
        }
    }


# ================= USERS CRUD ================= #

@app.get("/users")
async def get_users():
    users = users_collection.find({"role": {"$ne": "admin"}})

    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "fullName": user.get("fullName", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "role": user.get("role", "user"),
            "status": user.get("status", "active")
        })

    return result


@app.post("/users")
async def add_user(data: AddUserRequest):
    existing_user = users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = {
        "fullName": data.fullName,
        "email": data.email,
        "phone": data.phone,
        "password": data.password,
        "role": data.role,
        "status": data.status
    }

    result = users_collection.insert_one(new_user)

    return {
        "message": "User added successfully",
        "id": str(result.inserted_id)
    }


@app.put("/users/{user_id}")
async def update_user(user_id: str, data: UpdateUserRequest):
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "fullName": data.fullName,
                "email": data.email,
                "phone": data.phone,
                "role": data.role,
                "status": data.status
            }
        }
    )

    return {"message": "User updated successfully"}


@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Admin cannot be deleted")

    users_collection.delete_one({"_id": ObjectId(user_id)})

    return {"message": "User deleted successfully"}


# ================= MATERIALS ================= #

@app.post("/materials")
async def create_material(data: MaterialRequest):
    new_material = {
        "title": data.title,
        "description": data.description,
        "subject": data.subject,
        "semester": data.semester,
        "tags": data.tags,
        "uploadedBy": data.uploadedBy,
        "createdAt": datetime.utcnow()
    }

    result = materials_collection.insert_one(new_material)

    return {
        "message": "Material uploaded successfully",
        "id": str(result.inserted_id)
    }


@app.post("/upload")
async def upload_material(
    title: str = Form(...),
    description: str = Form(...),
    subject: str = Form(...),
    semester: str = Form(...),
    uploadedBy: str = Form(...),
    visibility: str = Form("public"),
    file: UploadFile = File(...)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    result = materials_collection.insert_one({
        "title": title,
        "description": description,
        "subject": subject,
        "semester": semester,
        "tags": [],
        "uploadedBy": uploadedBy,
        "visibility": visibility,
        "filename": file.filename,
        "savedBy": [],
        "createdAt": datetime.utcnow()
    })

    return {
        "message": "File uploaded successfully",
        "id": str(result.inserted_id)
    }


@app.get("/materials")
async def get_materials():
    materials = materials_collection.find({"visibility": "public"})

    result = []
    for m in materials:
        result.append({
            "id": str(m["_id"]),
            "title": m.get("title", ""),
            "description": m.get("description", ""),
            "subject": m.get("subject", ""),
            "semester": m.get("semester", ""),
            "tags": m.get("tags", []),
            "uploadedBy": m.get("uploadedBy", ""),
            "visibility": m.get("visibility", "public"),
            "filename": m.get("filename", ""),
            "savedBy": m.get("savedBy", [])
        })

    return result


@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path=file_path, filename=filename)

@app.get("/my-materials/{user_name}")
async def get_my_materials(user_name: str):
    materials = materials_collection.find({"uploadedBy": user_name})

    result = []
    for m in materials:
        result.append({
            "id": str(m["_id"]),
            "title": m.get("title", ""),
            "description": m.get("description", ""),
            "subject": m.get("subject", ""),
            "semester": m.get("semester", ""),
            "tags": m.get("tags", []),
            "uploadedBy": m.get("uploadedBy", ""),
            "visibility": m.get("visibility", "public"),
            "filename": m.get("filename", ""),
            "savedBy": m.get("savedBy", [])
        })

    return result


@app.post("/save-material/{material_id}/{user_name}")
async def save_material(material_id: str, user_name: str):
    materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {"$addToSet": {"savedBy": user_name}}
    )

    return {"message": "Material saved successfully"}


@app.get("/saved-materials/{user_name}")
async def get_saved_materials(user_name: str):
    materials = materials_collection.find({
        "visibility": "public",
        "savedBy": user_name,
        "uploadedBy": {"$ne": user_name}
    })

    result = []
    for m in materials:
        result.append({
            "id": str(m["_id"]),
            "title": m.get("title", ""),
            "description": m.get("description", ""),
            "subject": m.get("subject", ""),
            "semester": m.get("semester", ""),
            "tags": m.get("tags", []),
            "uploadedBy": m.get("uploadedBy", ""),
            "visibility": m.get("visibility", "public"),
            "filename": m.get("filename", ""),
            "savedBy": m.get("savedBy", [])
        })

    return result

@app.put("/materials/{material_id}")
async def update_material(material_id: str, data: UpdateMaterialRequest):
    material = materials_collection.find_one({"_id": ObjectId(material_id)})

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {
            "$set": {
                "title": data.title,
                "description": data.description,
                "subject": data.subject,
                "semester": data.semester,
                "tags": data.tags
            }
        }
    )

    return {"message": "Material updated successfully"}


@app.patch("/materials/{material_id}/visibility")
async def update_material_visibility(material_id: str):
    material = materials_collection.find_one({"_id": ObjectId(material_id)})

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    current_visibility = material.get("visibility", "public")
    new_visibility = "private" if current_visibility == "public" else "public"

    materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {"$set": {"visibility": new_visibility}}
    )

    return {
        "message": "Visibility updated successfully",
        "visibility": new_visibility
    }


@app.delete("/materials/{material_id}")
async def delete_material(material_id: str):
    material = materials_collection.find_one({"_id": ObjectId(material_id)})

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    filename = material.get("filename", "")
    file_path = os.path.join(UPLOAD_DIR, filename)

    materials_collection.delete_one({"_id": ObjectId(material_id)})

    if filename and os.path.exists(file_path):
        os.remove(file_path)

    return {"message": "Material deleted successfully"}

@app.post("/unsave-material/{material_id}/{user_name}")
async def unsave_material(material_id: str, user_name: str):
    materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {"$pull": {"savedBy": user_name}}
    )

    return {"message": "Material removed from saved"}

@app.post("/clean-own-saves")
async def clean_own_saves():
    materials = materials_collection.find()

    for m in materials:
        uploaded_by = m.get("uploadedBy", "")
        if uploaded_by:
            materials_collection.update_one(
                {"_id": m["_id"]},
                {"$pull": {"savedBy": uploaded_by}}
            )

    return {"message": "Own saves cleaned"}

@app.get("/admin/materials")
async def get_admin_materials():
    materials = materials_collection.find()

    result = []
    for m in materials:
        result.append({
            "id": str(m["_id"]),
            "title": m.get("title", ""),
            "description": m.get("description", ""),
            "subject": m.get("subject", ""),
            "semester": m.get("semester", ""),
            "tags": m.get("tags", []),
            "uploadedBy": m.get("uploadedBy", ""),
            "visibility": m.get("visibility", "public"),
            "filename": m.get("filename", ""),
            "savedBy": m.get("savedBy", [])
        })

    return result


@app.delete("/admin/materials/{material_id}")
async def admin_delete_material(material_id: str):
    material = materials_collection.find_one({"_id": ObjectId(material_id)})

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    filename = material.get("filename", "")
    file_path = os.path.join(UPLOAD_DIR, filename)

    materials_collection.delete_one({"_id": ObjectId(material_id)})

    if filename and os.path.exists(file_path):
        os.remove(file_path)

    return {"message": "Material deleted successfully"}


@app.patch("/admin/materials/{material_id}/visibility")
async def admin_toggle_visibility(material_id: str):
    material = materials_collection.find_one({"_id": ObjectId(material_id)})

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    current_visibility = material.get("visibility", "public")
    new_visibility = "private" if current_visibility == "public" else "public"

    materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {"$set": {"visibility": new_visibility}}
    )

    return {
        "message": "Visibility updated successfully",
        "visibility": new_visibility
    }

@app.put("/admin/materials/{material_id}")
def admin_update_material(material_id: str, updated: dict):
    material = materials_collection.find_one({"_id": ObjectId(material_id)})

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {"$set": {
            "title": updated.get("title", ""),
            "description": updated.get("description", ""),
            "subject": updated.get("subject", ""),
            "semester": updated.get("semester", ""),
        }}
    )

    return {"message": "Material updated"}