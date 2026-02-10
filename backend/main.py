from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

app = FastAPI()

# ✅ CORS باش يقبل requests من Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# 🧠 AI DETECTION (EXISTING)
# =====================================================
@app.post("/ai/detect")
async def ai_detect(file: UploadFile = File(...)):
    # ✅ دابا غير response تجريبي
    return {
        "species": "Sardine commune",
        "sizeCm": 32,
        "weightG": 280,
        "legal": True,
        "rule": "Taille minimale respectée (20 cm).",
        "confidence": 0.91,
    }

# =====================================================
# 🔐 AUTH (FAKE - DEMO)
# =====================================================

# ✅ Fake DB (غير للتجربة دابا)
USERS = {}

# -------- MODELS --------
class RegisterBody(BaseModel):
    name: str
    phone: str
    email: str
    password: str

class LoginBody(BaseModel):
    email: str
    password: str

# -------- ROUTES --------
@app.post("/auth/register")
async def register(body: RegisterBody):
    if body.email in USERS:
        return {"ok": False, "message": "Email déjà utilisé"}

    USERS[body.email] = {
        "name": body.name,
        "phone": body.phone,
        "email": body.email,
        "password": body.password,  # ⚠️ plain password (demo فقط)
    }

    return {
        "ok": True,
        "token": "demo-token",
        "user": {
            "name": body.name,
            "phone": body.phone,
            "email": body.email,
        },
    }

@app.post("/auth/login")
async def login(body: LoginBody):
    u = USERS.get(body.email)

    if not u or u["password"] != body.password:
        return {"ok": False, "message": "Email ou mot de passe incorrect"}

    return {
        "ok": True,
        "token": "demo-token",
        "user": {
            "name": u["name"],
            "phone": u["phone"],
            "email": u["email"],
        },
    }

# =====================================================
# 📓 LOGBOOK (DEMO)
# =====================================================

class CaptureBody(BaseModel):
    species: str
    weightKg: float
    sizeCm: Optional[int] = None
    city: str
    zone: str
    dateISO: str   # مثال: "2026-02-09"
    timeStr: str   # مثال: "11:39 PM"
    photoUri: Optional[str] = None  # دابا نص فقط

# ✅ Demo storage (memory)
CAPTURES = []

@app.post("/logbook/add")
async def add_capture(body: CaptureBody):
    item = body.model_dump()
    item["id"] = str(int(datetime.utcnow().timestamp() * 1000))
    CAPTURES.insert(0, item)
    return {"ok": True, "capture": item}

@app.get("/logbook/list")
def list_captures():
    return {"ok": True, "items": CAPTURES}

