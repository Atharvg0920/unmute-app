from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import random
import logging
from datetime import datetime, timezone
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.llm.chat import LlmChat, UserMessage

# ------------------------------------------------------------------
# Config
# ------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("unmute")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
JWT_ALG = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24 * 7  # 7 days for demo comfort

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Unmute API")
api = APIRouter(prefix="/api")


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Other"]

ANON_ADJECTIVES = ["Curious", "Quiet", "Brave", "Silent", "Bright", "Calm", "Clever", "Mellow", "Witty", "Bold", "Gentle", "Swift"]
ANON_ANIMALS = ["Fox", "Owl", "Panda", "Koala", "Otter", "Wolf", "Lynx", "Hawk", "Puma", "Raven", "Deer", "Tiger"]

BADGE_RULES = [
    {"id": "first_question", "label": "First Voice", "desc": "Asked your first question", "icon": "MessageCircle"},
    {"id": "curious_mind", "label": "Curious Mind", "desc": "Asked 5 questions", "icon": "Brain"},
    {"id": "top_contributor", "label": "Top Contributor", "desc": "10+ upvotes on your questions", "icon": "Trophy"},
    {"id": "streak_starter", "label": "Streak Starter", "desc": "Asked on 3 different days", "icon": "Flame"},
]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(now.timestamp()) + ACCESS_TOKEN_MINUTES * 60,
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def new_handle() -> str:
    return f"{random.choice(ANON_ADJECTIVES)} {random.choice(ANON_ANIMALS)} #{random.randint(1000, 9999)}"


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u["name"],
        "role": u["role"],
        "handle": u.get("handle"),
        "subjects": u.get("subjects", []),
        "created_at": u.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_student(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    return user


async def require_teacher(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    return user


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_MINUTES * 60,
        path="/",
    )


# ------------------------------------------------------------------
# AI helpers (GPT-5.2 via Emergent key)
# ------------------------------------------------------------------
async def _ask_llm(system: str, prompt: str, session_id: str) -> str:
    if not EMERGENT_LLM_KEY:
        return ""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model("openai", "gpt-5.2")
    try:
        resp = await chat.send_message(UserMessage(text=prompt))
        return (resp or "").strip()
    except Exception as e:
        logger.warning(f"LLM error: {e}")
        return ""


async def ai_rewrite(text: str) -> str:
    sys = "You are a supportive writing coach for shy students. Rewrite their question in one sentence, clearer, kinder, academically precise. Keep the meaning; don't add info. Output ONLY the improved question, no preface."
    out = await _ask_llm(sys, text, f"rewrite-{uuid.uuid4().hex[:8]}")
    return out or text


async def ai_auto_answer(text: str, subject: str) -> str:
    sys = f"You are a helpful {subject} tutor writing a concise answer (under 120 words) for a student. Be clear, accurate, encouraging. Use plain text only."
    return await _ask_llm(sys, text, f"answer-{uuid.uuid4().hex[:8]}")


async def ai_moderate(text: str) -> dict:
    """Returns {flagged: bool, reason: str}."""
    sys = (
        "You are a moderation classifier for a student Q&A app. "
        "Classify the message. Reply with EXACTLY one line in this format: "
        "FLAG=yes REASON=<abuse|spam|irrelevant> or FLAG=no REASON=ok. "
        "Flag only if message is abusive, hateful, clearly spam, or entirely off-topic gibberish."
    )
    out = await _ask_llm(sys, text, f"mod-{uuid.uuid4().hex[:8]}")
    flagged = "flag=yes" in out.lower()
    reason = "ok"
    if flagged:
        for r in ["abuse", "spam", "irrelevant"]:
            if r in out.lower():
                reason = r
                break
    return {"flagged": flagged, "reason": reason}


# ------------------------------------------------------------------
# Models
# ------------------------------------------------------------------
class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    name: str = Field(min_length=1, max_length=80)
    role: Literal["student", "teacher"]
    subjects: Optional[List[str]] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class AskBody(BaseModel):
    body: str = Field(min_length=5, max_length=1200)
    subject: str
    tags: List[str] = []
    is_public: bool = True


class AnswerBody(BaseModel):
    body: str = Field(min_length=1, max_length=4000)
    is_public: bool = True


class TextBody(BaseModel):
    text: str = Field(min_length=1, max_length=1200)
    subject: Optional[str] = "General"


# ------------------------------------------------------------------
# Startup: indexes + seed
# ------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.questions.create_index("id", unique=True)
    await db.questions.create_index([("created_at", -1)])
    await db.answers.create_index("id", unique=True)
    await db.answers.create_index("question_id")

    async def seed_user(email, password, name, role, subjects=None, handle=None):
        existing = await db.users.find_one({"email": email})
        if existing:
            return
        user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "name": name,
            "role": role,
            "subjects": subjects or [],
            "handle": handle,
            "badges": [],
            "created_at": utcnow_iso(),
        }
        await db.users.insert_one(user)
        logger.info(f"Seeded {role}: {email}")

    await seed_user("priya.sharma@unmute.edu", "Teacher@123", "Priya Sharma", "teacher", ["Mathematics", "Physics"])
    await seed_user("arjun.mehta@unmute.edu", "Teacher@123", "Arjun Mehta", "teacher", ["Computer Science"])
    await seed_user("ritika.verma@unmute.edu", "Teacher@123", "Ritika Verma", "teacher", ["Biology", "Chemistry"])
    await seed_user("student.demo@unmute.edu", "Student@123", "Demo Student", "student", handle="Curious Fox #1001")

    logger.info("Unmute backend ready")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ------------------------------------------------------------------
# Health / meta
# ------------------------------------------------------------------
@api.get("/")
async def root():
    return {"app": "Unmute", "status": "ok", "time": utcnow_iso()}


@api.get("/meta/subjects")
async def meta_subjects():
    return {"subjects": SUBJECTS}


# ------------------------------------------------------------------
# Auth
# ------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name.strip(),
        "role": body.role,
        "subjects": body.subjects or [] if body.role == "teacher" else [],
        "handle": new_handle() if body.role == "student" else None,
        "badges": [],
        "created_at": utcnow_iso(),
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["role"])
    set_auth_cookie(response, token)
    return {"user": public_user(user), "token": token}


@api.post("/auth/login")
async def login(body: LoginBody, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["role"])
    set_auth_cookie(response, token)
    return {"user": public_user(user), "token": token}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}


# ------------------------------------------------------------------
# Questions
# ------------------------------------------------------------------
def public_question(q: dict, me_id: Optional[str] = None) -> dict:
    return {
        "id": q["id"],
        "body": q["body"],
        "subject": q["subject"],
        "tags": q.get("tags", []),
        "handle": q.get("handle"),
        "upvotes": q.get("upvotes", 0),
        "has_upvoted": (me_id in q.get("upvoted_by", [])) if me_id else False,
        "status": q.get("status", "open"),
        "is_public": q.get("is_public", True),
        "ai_flagged": q.get("ai_flagged", False),
        "flag_reason": q.get("flag_reason"),
        "created_at": q.get("created_at"),
        "answered_at": q.get("answered_at"),
        "teacher_id": q.get("teacher_id"),
        "assigned_teacher_name": q.get("assigned_teacher_name"),
    }


async def _route_to_teacher(subject: str) -> Optional[dict]:
    # pick a teacher who teaches this subject
    cursor = db.users.find({"role": "teacher", "subjects": subject}, {"_id": 0})
    teachers = await cursor.to_list(100)
    if not teachers:
        teachers = await db.users.find({"role": "teacher"}, {"_id": 0}).to_list(100)
    return random.choice(teachers) if teachers else None


@api.post("/questions")
async def ask_question(body: AskBody, user: dict = Depends(require_student)):
    if body.subject not in SUBJECTS:
        raise HTTPException(status_code=400, detail="Invalid subject")

    moderation = await ai_moderate(body.body)
    teacher = await _route_to_teacher(body.subject)

    q = {
        "id": str(uuid.uuid4()),
        "student_id": user["id"],
        "handle": user.get("handle") or "Anonymous",
        "body": body.body.strip(),
        "subject": body.subject,
        "tags": [t.strip().lower() for t in body.tags if t.strip()][:5],
        "upvotes": 0,
        "upvoted_by": [],
        "status": "flagged" if moderation["flagged"] else "open",
        "is_public": body.is_public,
        "ai_flagged": moderation["flagged"],
        "flag_reason": moderation["reason"] if moderation["flagged"] else None,
        "teacher_id": teacher["id"] if teacher else None,
        "assigned_teacher_name": teacher["name"] if teacher else None,
        "answered_at": None,
        "created_at": utcnow_iso(),
    }
    await db.questions.insert_one(q)

    # badge: first question
    await _award_badge_if(user["id"], "first_question", condition=True)
    asked = await db.questions.count_documents({"student_id": user["id"]})
    if asked >= 5:
        await _award_badge_if(user["id"], "curious_mind", True)

    return {"question": public_question(q, user["id"])}


@api.get("/questions")
async def list_feed(
    subject: Optional[str] = None,
    sort: Literal["recent", "popular"] = "recent",
    only: Literal["all", "answered", "open"] = "answered",
    request: Request = None,
):
    query = {"is_public": True, "ai_flagged": False}
    if subject and subject != "All":
        query["subject"] = subject
    if only == "answered":
        query["status"] = "answered"
    elif only == "open":
        query["status"] = "open"

    sort_spec = [("upvotes", -1), ("created_at", -1)] if sort == "popular" else [("created_at", -1)]
    qs = await db.questions.find(query, {"_id": 0}).sort(sort_spec).limit(100).to_list(100)

    me_id = None
    try:
        u = await get_current_user(request)
        me_id = u["id"]
    except Exception:
        pass

    return {"questions": [public_question(q, me_id) for q in qs]}


@api.get("/questions/mine")
async def my_questions(user: dict = Depends(require_student)):
    qs = await db.questions.find({"student_id": user["id"]}, {"_id": 0}).sort([("created_at", -1)]).to_list(200)
    return {"questions": [public_question(q, user["id"]) for q in qs]}


@api.get("/questions/inbox")
async def teacher_inbox(
    status: Literal["open", "answered", "all"] = "open",
    user: dict = Depends(require_teacher),
):
    query = {"ai_flagged": False}
    subjects = user.get("subjects", [])
    if subjects:
        query["subject"] = {"$in": subjects}
    if status != "all":
        query["status"] = status
    qs = await db.questions.find(query, {"_id": 0}).sort([("upvotes", -1), ("created_at", -1)]).limit(200).to_list(200)
    return {"questions": [public_question(q, user["id"]) for q in qs]}


@api.get("/questions/{qid}")
async def get_question(qid: str, request: Request):
    q = await db.questions.find_one({"id": qid}, {"_id": 0})
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    answers = await db.answers.find({"question_id": qid}, {"_id": 0}).sort([("created_at", 1)]).to_list(100)
    me_id = None
    try:
        u = await get_current_user(request)
        me_id = u["id"]
    except Exception:
        pass
    return {"question": public_question(q, me_id), "answers": answers}


@api.post("/questions/{qid}/upvote")
async def toggle_upvote(qid: str, user: dict = Depends(get_current_user)):
    q = await db.questions.find_one({"id": qid}, {"_id": 0})
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    voters = set(q.get("upvoted_by", []))
    if user["id"] in voters:
        voters.remove(user["id"])
    else:
        voters.add(user["id"])
    upvotes = len(voters)
    await db.questions.update_one({"id": qid}, {"$set": {"upvoted_by": list(voters), "upvotes": upvotes}})

    # Top Contributor badge
    author_id = q.get("student_id")
    if author_id:
        agg = await db.questions.aggregate([
            {"$match": {"student_id": author_id}},
            {"$group": {"_id": None, "total": {"$sum": "$upvotes"}}},
        ]).to_list(1)
        total_up = (agg[0]["total"] if agg else 0)
        if total_up >= 10:
            await _award_badge_if(author_id, "top_contributor", True)

    return {"upvotes": upvotes, "has_upvoted": user["id"] in voters}


@api.post("/questions/{qid}/flag")
async def flag_question(qid: str, user: dict = Depends(get_current_user)):
    q = await db.questions.find_one({"id": qid}, {"_id": 0})
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    await db.questions.update_one({"id": qid}, {"$set": {"ai_flagged": True, "flag_reason": "reported"}})
    return {"ok": True}


@api.post("/questions/{qid}/answer")
async def answer_question(qid: str, body: AnswerBody, user: dict = Depends(require_teacher)):
    q = await db.questions.find_one({"id": qid}, {"_id": 0})
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    ans = {
        "id": str(uuid.uuid4()),
        "question_id": qid,
        "teacher_id": user["id"],
        "teacher_name": user["name"],
        "body": body.body.strip(),
        "is_public": body.is_public,
        "created_at": utcnow_iso(),
    }
    await db.answers.insert_one(ans)
    ans.pop("_id", None)
    await db.questions.update_one(
        {"id": qid},
        {"$set": {
            "status": "answered",
            "answered_at": utcnow_iso(),
            "is_public": body.is_public and q.get("is_public", True),
            "teacher_id": user["id"],
            "assigned_teacher_name": user["name"],
        }},
    )
    return {"answer": ans}


# ------------------------------------------------------------------
# AI
# ------------------------------------------------------------------
@api.post("/ai/rewrite")
async def api_rewrite(body: TextBody, user: dict = Depends(get_current_user)):
    out = await ai_rewrite(body.text)
    return {"rewritten": out}


@api.post("/ai/auto-answer")
async def api_auto_answer(body: TextBody, user: dict = Depends(get_current_user)):
    out = await ai_auto_answer(body.text, body.subject or "General")
    return {"answer": out}


@api.post("/ai/similar")
async def api_similar(body: TextBody, user: dict = Depends(get_current_user)):
    # Lightweight similarity: keyword match on answered questions
    tokens = [w for w in body.text.lower().split() if len(w) > 3][:8]
    if not tokens:
        return {"similar": []}
    regex = "|".join(tokens)
    cursor = db.questions.find(
        {"status": "answered", "is_public": True, "body": {"$regex": regex, "$options": "i"}},
        {"_id": 0},
    ).sort([("upvotes", -1)]).limit(5)
    qs = await cursor.to_list(5)
    return {"similar": [{"id": q["id"], "body": q["body"], "subject": q["subject"]} for q in qs]}


# ------------------------------------------------------------------
# Stats / Badges
# ------------------------------------------------------------------
@api.get("/stats/heatmap")
async def stats_heatmap():
    pipe = [{"$group": {"_id": "$subject", "count": {"$sum": 1}}}]
    agg = await db.questions.aggregate(pipe).to_list(50)
    total = sum(x["count"] for x in agg) or 1
    data = [{"subject": x["_id"], "count": x["count"], "ratio": round(x["count"] / total, 3)} for x in agg]
    data.sort(key=lambda x: -x["count"])
    return {"heatmap": data, "total": total}


async def _award_badge_if(user_id: str, badge_id: str, condition: bool):
    if not condition:
        return
    await db.users.update_one(
        {"id": user_id, "badges": {"$ne": badge_id}},
        {"$addToSet": {"badges": badge_id}},
    )


@api.get("/me/badges")
async def my_badges(user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    owned = set(u.get("badges", []) if u else [])
    return {
        "badges": [
            {**b, "owned": b["id"] in owned}
            for b in BADGE_RULES
        ]
    }


# ------------------------------------------------------------------
# Wire up
# ------------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
