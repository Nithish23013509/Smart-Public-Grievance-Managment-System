import re


DOMAIN_ALIASES = {

    "water_supply": [
        "குடிநீர்",
        "தண்ணீர்",
        "தண்ணி",
        "water supply",
        "water problem",
        "drinking water",
        "water shortage",
        "water leak",
        "water leakage"
    ],

    "street_lighting": [
        "தெருவிளக்கு",
        "தெரு விளக்கு",
        "street light",
        "streetlight",
        "street lighting",
        "street lamp"
    ],

    "sanitation": [
        "குப்பை",
        "குப்பை வண்டி",
        "garbage",
        "garbage collection",
        "waste",
        "trash"
    ],

    "roads": [
        "சாலை",
        "சாலையில்",
        "road",
        "roads",
        "pothole",
        "பள்ளம்"
    ],

    "drainage": [
        "கழிவுநீர்",
        "சாக்கடை",
        "drainage",
        "drain",
        "sewage"
    ],

    "electricity": [
        "மின்சாரம்",
        "மின்சாரம் இல்லை",
        "electricity",
        "power cut",
        "power supply"
    ]
}


def normalize_text(text: str) -> str:

    text = str(text).lower().strip()

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text