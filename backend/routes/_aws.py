"""Shared AWS helpers for ReLoop routes.

Loads the .env at import time (so boto3 picks up credentials from the
environment), exposes lazily-created Bedrock + DynamoDB clients, a thin
wrapper over the Bedrock `converse` API, a tolerant JSON parser for model
output, and a fail-soft DynamoDB read.
"""
import base64
import json
import os

import boto3
from dotenv import load_dotenv

# Load .env at import time so boto3 sees AWS_ACCESS_KEY_ID / SECRET / REGION.
load_dotenv()

BEDROCK_REGION = "us-east-1"  # all Bedrock calls run in us-east-1
DYNAMO_REGION = os.getenv("AWS_REGION", "us-east-1")

TABLE_PRODUCTS = os.getenv("DYNAMODB_TABLE_PRODUCTS", "products")
TABLE_RETURNS = os.getenv("DYNAMODB_TABLE_RETURNS", "returns")
TABLE_USERS = os.getenv("DYNAMODB_TABLE_USERS", "users")

_bedrock = None
_dynamodb = None


def get_bedrock():
    """Lazily create (and cache) the Bedrock runtime client."""
    global _bedrock
    if _bedrock is None:
        _bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
    return _bedrock


def get_dynamodb():
    """Lazily create (and cache) the DynamoDB resource."""
    global _dynamodb
    if _dynamodb is None:
        _dynamodb = boto3.resource("dynamodb", region_name=DYNAMO_REGION)
    return _dynamodb


def converse_text(model_id: str, prompt: str) -> str:
    """Call a Bedrock model via the converse API and return its text reply.

    The response shape is identical for Nova and Claude models:
    response["output"]["message"]["content"][0]["text"].
    """
    response = get_bedrock().converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
    )
    return response["output"]["message"]["content"][0]["text"]


def converse_image(
    model_id: str, prompt: str, image_b64: str, image_format: str = "jpeg"
) -> str:
    """Call a multimodal Bedrock model with a text prompt + one image.

    `image_b64` is plain base64 (no `data:` prefix). We decode it to raw bytes
    because boto3 base64-encodes blob fields itself — passing the string would
    double-encode. `image_format` is one of: png, jpeg, gif, webp.
    """
    image_bytes = base64.b64decode(image_b64)
    response = get_bedrock().converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [
                    {"text": prompt},
                    {
                        "image": {
                            "format": image_format,
                            "source": {"bytes": image_bytes},
                        }
                    },
                ],
            }
        ],
    )
    return response["output"]["message"]["content"][0]["text"]


def parse_model_json(text: str):
    """Parse JSON from a model reply, tolerating ```json ... ``` code fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
        if cleaned[:4].lower() == "json":
            cleaned = cleaned[4:]
        if cleaned.rstrip().endswith("```"):
            cleaned = cleaned.rstrip()[:-3]
    return json.loads(cleaned.strip())


def get_item(table_name: str, key: dict):
    """Fetch a single DynamoDB item, returning None on any failure.

    Swallows missing-table / missing-item / credential errors so the demo
    never breaks on infrastructure that isn't fully provisioned yet.
    """
    try:
        resp = get_dynamodb().Table(table_name).get_item(Key=key)
        return resp.get("Item")
    except Exception as exc:  # noqa: BLE001 - demo resilience
        print(f"[DynamoDB] get_item({table_name}, {key}) failed: {exc}")
        return None
