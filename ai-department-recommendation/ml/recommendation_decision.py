def get_decision(confidence):

    if confidence >= 0.70:
        return "AUTO_RECOMMENDED"

    elif confidence >= 0.40:
        return "RECOMMENDED"

    return "REVIEW_REQUIRED"