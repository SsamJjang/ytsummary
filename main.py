from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
import uvicorn
from gemini import generate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/summary")
def summary(videoId: str):
    transcript = YouTubeTranscriptApi().fetch(videoId, languages=['en'])
    full_text = " ".join(item.text for item in transcript)
    summary = generate(full_text)
    return {"summary": summary}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=1234)