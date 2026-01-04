import json
import logging

import stripe

from utils.config_utils import get_stripe_key

# Logger setup
logger = logging.getLogger(__name__)

def check_promo_is_valid(user_input_promo: str) -> bool:
    user_input_promo = user_input_promo.strip()[:16]
    get_stripe_key()
    try:
        payload = stripe.PromotionCode.list(code=user_input_promo, active=True)
        promo = json.loads(payload).get("data")
        return len(promo) > 0
    except stripe.error.StripeError as e:
        logger.error("Error retrieving promocode %s" % e)
    return False
