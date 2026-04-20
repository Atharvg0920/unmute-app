"""Backend regression tests for Unmute platform.

Covers auth, questions CRUD, role guards, AI endpoints, stats, badges.
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://doubt-hub-10.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

STUDENT_EMAIL = "student.demo@unmute.edu"
STUDENT_PASS = "Student@123"
TEACHER_EMAIL = "priya.sharma@unmute.edu"  # Math/Physics
TEACHER_PASS = "Teacher@123"
TEACHER_CS_EMAIL = "arjun.mehta@unmute.edu"


# ---------------- Fixtures ----------------
class NoCookieSession(requests.Session):
    """Session that never persists cookies so Bearer token takes effect."""
    def send(self, request, **kwargs):
        kwargs.setdefault("allow_redirects", True)
        resp = super().send(request, **kwargs)
        self.cookies.clear()
        return resp


@pytest.fixture(scope="session")
def s():
    session = NoCookieSession()
    session.headers.update({"Content-Type": "application/json"})
    return session


def _login(session, email, password):
    r = session.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"login failed {email}: {r.status_code} {r.text}"
    return r.json()


@pytest.fixture(scope="session")
def student_token(s):
    return _login(s, STUDENT_EMAIL, STUDENT_PASS)["token"]


@pytest.fixture(scope="session")
def teacher_token(s):
    return _login(s, TEACHER_EMAIL, TEACHER_PASS)["token"]


@pytest.fixture(scope="session")
def teacher_cs_token(s):
    return _login(s, TEACHER_CS_EMAIL, TEACHER_PASS)["token"]


def _h(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ---------------- Health ----------------
class TestHealth:
    def test_root(self, s):
        r = s.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["app"] == "Unmute"

    def test_subjects(self, s):
        r = s.get(f"{API}/meta/subjects")
        assert r.status_code == 200
        subs = r.json()["subjects"]
        for x in ["Mathematics", "Physics", "Computer Science"]:
            assert x in subs


# ---------------- Auth ----------------
class TestAuth:
    def test_login_student(self, s):
        data = _login(s, STUDENT_EMAIL, STUDENT_PASS)
        assert "token" in data and len(data["token"]) > 20
        assert data["user"]["role"] == "student"
        assert data["user"]["handle"]  # student has handle

    def test_login_teacher(self, s):
        data = _login(s, TEACHER_EMAIL, TEACHER_PASS)
        assert data["user"]["role"] == "teacher"
        assert data["user"]["handle"] in (None, "")
        assert "Mathematics" in data["user"]["subjects"]

    def test_login_bad_credentials(self, s):
        r = s.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_bearer(self, s, student_token):
        r = s.get(f"{API}/auth/me", headers=_h(student_token))
        assert r.status_code == 200
        assert r.json()["user"]["email"] == STUDENT_EMAIL

    def test_me_without_token(self, s):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_register_student_assigns_handle(self, s):
        email = f"test_student_{uuid.uuid4().hex[:8]}@unmute.edu"
        r = s.post(f"{API}/auth/register", json={
            "email": email, "password": "Student@123", "name": "Test Student", "role": "student"
        })
        assert r.status_code == 200
        body = r.json()
        assert body["user"]["handle"], "student should get auto handle"
        assert body["user"]["role"] == "student"
        assert body["token"]

    def test_register_teacher_keeps_subjects(self, s):
        email = f"test_teacher_{uuid.uuid4().hex[:8]}@unmute.edu"
        r = s.post(f"{API}/auth/register", json={
            "email": email, "password": "Teach@123", "name": "T T",
            "role": "teacher", "subjects": ["English"]
        })
        assert r.status_code == 200
        u = r.json()["user"]
        assert u["role"] == "teacher"
        assert u["handle"] in (None, "")
        assert "English" in u["subjects"]

    def test_register_duplicate(self, s):
        r = s.post(f"{API}/auth/register", json={
            "email": STUDENT_EMAIL, "password": "Student@123", "name": "x", "role": "student"
        })
        assert r.status_code == 400


# ---------------- Questions ----------------
class TestQuestions:
    def test_ask_routes_to_teacher(self, s, student_token):
        r = s.post(f"{API}/questions", headers=_h(student_token), json={
            "body": "TEST_ What is Newton's second law and how do we use it?",
            "subject": "Physics", "tags": ["newton", "mechanics"]
        })
        assert r.status_code == 200, r.text
        q = r.json()["question"]
        assert q["subject"] == "Physics"
        assert q["status"] in ("open", "flagged")
        assert q["assigned_teacher_name"] in ("Priya Sharma",)
        pytest.shared_qid = q["id"]

    def test_ask_invalid_subject(self, s, student_token):
        r = s.post(f"{API}/questions", headers=_h(student_token), json={
            "body": "TEST_ Does this work?", "subject": "Astrology"
        })
        assert r.status_code == 400

    def test_feed_public(self, s):
        r = s.get(f"{API}/questions?only=all")
        assert r.status_code == 200
        assert isinstance(r.json()["questions"], list)

    def test_feed_filter_subject(self, s):
        r = s.get(f"{API}/questions?subject=Physics&only=all&sort=recent")
        assert r.status_code == 200
        for q in r.json()["questions"]:
            assert q["subject"] == "Physics"

    def test_get_question_detail(self, s):
        qid = getattr(pytest, "shared_qid", None)
        assert qid
        r = s.get(f"{API}/questions/{qid}")
        assert r.status_code == 200
        body = r.json()
        assert body["question"]["id"] == qid
        assert isinstance(body["answers"], list)

    def test_questions_mine(self, s, student_token):
        r = s.get(f"{API}/questions/mine", headers=_h(student_token))
        assert r.status_code == 200
        qs = r.json()["questions"]
        assert any(q["id"] == getattr(pytest, "shared_qid", "") for q in qs)

    def test_upvote_toggle(self, s, teacher_token):
        qid = getattr(pytest, "shared_qid", None)
        r1 = s.post(f"{API}/questions/{qid}/upvote", headers=_h(teacher_token))
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["has_upvoted"] is True
        u1 = d1["upvotes"]
        r2 = s.post(f"{API}/questions/{qid}/upvote", headers=_h(teacher_token))
        d2 = r2.json()
        assert d2["has_upvoted"] is False
        assert d2["upvotes"] == u1 - 1

    def test_teacher_inbox_filtered_by_subjects(self, s, teacher_token):
        r = s.get(f"{API}/questions/inbox?status=all", headers=_h(teacher_token))
        assert r.status_code == 200
        qs = r.json()["questions"]
        for q in qs:
            assert q["subject"] in ("Mathematics", "Physics")

    def test_teacher_answers_question(self, s, teacher_token):
        qid = getattr(pytest, "shared_qid", None)
        r = s.post(f"{API}/questions/{qid}/answer", headers=_h(teacher_token), json={
            "body": "TEST_ F = m*a. It means force equals mass times acceleration."
        })
        assert r.status_code == 200, r.text
        ans = r.json()["answer"]
        assert ans["question_id"] == qid
        # verify persisted
        det = s.get(f"{API}/questions/{qid}").json()
        assert det["question"]["status"] == "answered"
        assert len(det["answers"]) >= 1

    def test_flag_question(self, s, student_token):
        # create then flag
        r = s.post(f"{API}/questions", headers=_h(student_token), json={
            "body": "TEST_ temporary question to flag please.", "subject": "Other"
        })
        qid = r.json()["question"]["id"]
        rf = s.post(f"{API}/questions/{qid}/flag", headers=_h(student_token))
        assert rf.status_code == 200
        assert rf.json()["ok"] is True


# ---------------- Role guards ----------------
class TestRoleGuards:
    def test_student_cannot_access_inbox(self, s, student_token):
        r = s.get(f"{API}/questions/inbox", headers=_h(student_token))
        assert r.status_code == 403

    def test_teacher_cannot_access_mine(self, s, teacher_token):
        r = s.get(f"{API}/questions/mine", headers=_h(teacher_token))
        assert r.status_code == 403

    def test_teacher_cannot_post_question(self, s, teacher_token):
        r = s.post(f"{API}/questions", headers=_h(teacher_token), json={
            "body": "TEST_ I am teacher.", "subject": "Mathematics"
        })
        assert r.status_code == 403


# ---------------- AI ----------------
class TestAI:
    def test_rewrite(self, s, student_token):
        r = s.post(f"{API}/ai/rewrite", headers=_h(student_token),
                   json={"text": "i dont get newtons 2nd law can u help pls"})
        assert r.status_code == 200
        out = r.json().get("rewritten", "")
        assert isinstance(out, str) and len(out) > 0

    def test_auto_answer(self, s, student_token):
        r = s.post(f"{API}/ai/auto-answer", headers=_h(student_token),
                   json={"text": "What is Newton's second law?", "subject": "Physics"})
        assert r.status_code == 200
        assert isinstance(r.json().get("answer", ""), str)

    def test_similar(self, s, student_token):
        r = s.post(f"{API}/ai/similar", headers=_h(student_token),
                   json={"text": "Newton second law force mass acceleration"})
        assert r.status_code == 200
        assert isinstance(r.json().get("similar", []), list)


# ---------------- Stats / Badges ----------------
class TestStatsBadges:
    def test_heatmap(self, s):
        r = s.get(f"{API}/stats/heatmap")
        assert r.status_code == 200
        data = r.json()
        assert "heatmap" in data and "total" in data

    def test_badges_first_question_unlocked(self, s, student_token):
        r = s.get(f"{API}/me/badges", headers=_h(student_token))
        assert r.status_code == 200
        badges = r.json()["badges"]
        fq = next(b for b in badges if b["id"] == "first_question")
        assert fq["owned"] is True
