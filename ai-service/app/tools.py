import os
from collections import Counter

import requests
from dotenv import load_dotenv

load_dotenv()

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")
BACKEND_EMAIL = os.getenv("BACKEND_EMAIL")
BACKEND_PASSWORD = os.getenv("BACKEND_PASSWORD")


def get_asset_summary() -> dict:
    """
    Get the current asset statistics from the Equipment & Asset Management System.
    Use this tool when the user asks about asset counts or asset statuses.
    """

    # 1. Login and get JWT
    login_response = requests.post(
        f"{BACKEND_BASE_URL}/api/auth/login",
        json={
            "email": BACKEND_EMAIL,
            "password": BACKEND_PASSWORD
        },
        timeout=10
    )

    login_response.raise_for_status()

    token = login_response.json()["accessToken"]

    # 2. Get assets
    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(
        f"{BACKEND_BASE_URL}/api/assets",
        headers=headers,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    if isinstance(data, list):
        assets = data

    elif isinstance(data, dict) and "content" in data:
        assets = data["content"]

        if "totalPages" in data:
            total_pages = data["totalPages"]
        elif "page" in data and isinstance(data["page"], dict):
            total_pages = data["page"].get("totalPages", 1)
        else:
            total_pages = 1

        for page_number in range(1, total_pages):
            page_response = requests.get(
                f"{BACKEND_BASE_URL}/api/assets",
                headers=headers,
                params={"page": page_number},
                timeout=10
            )

            page_response.raise_for_status()

            assets.extend(
                page_response.json()["content"]
            )

    else:
        raise ValueError("Unexpected assets API response format")

    # 3. Calculate statistics
    status_counts = Counter(
        asset.get("status", "UNKNOWN")
        for asset in assets
    )

    return {
        "total_assets": len(assets),
        "assets_by_status": dict(status_counts)
    }