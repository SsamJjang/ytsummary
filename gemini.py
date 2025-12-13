from google import genai
from google.genai import types


def generate(body):
    client = genai.Client(
        api_key="AIzaSyDgS3PMz0_II-CFqz3UBMrbCw1eFq96kCk",
    )

    model = "gemini-flash-lite-latest"

    # system 프롬프트를 user 메시지에 포함
    system_prompt = (
        "You are a professional assistant analyzing captions for Youtube Videos. "
        "Refer to the given captions and create a detailed summary.\n\n"
    )

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=body),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=0,
        ),
        system_instruction=[
            types.Part.from_text(text=system_prompt),
        ],
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )
    return response.text
