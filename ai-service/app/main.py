from fastapi import FastAPI
from pydantic import BaseModel

from app.agent import ask_agent
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Equipment & Asset AI Service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str


@app.get("/")
def root():
    return {
        "message": "Equipment & Asset AI Service is running"
    }


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    answer = ask_agent(request.message)

    return ChatResponse(answer=answer)