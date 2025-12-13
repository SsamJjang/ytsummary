from youtube_transcript_api import YouTubeTranscriptApi

transcript = YouTubeTranscriptApi().fetch(
    "gV_AnL2o3D0",
    languages=['en']
)


full_text = " ".join([item.text for item in transcript])

print(full_text)
