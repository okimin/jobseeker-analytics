import logging

import stripe
from fastapi.concurrency import run_in_threadpool

from utils.config_utils import get_stripe_key, get_settings

# Logger setup
logger = logging.getLogger(__name__)

settings = get_settings()

async def check_promo_is_valid(user_input_promo: str) -> bool:
    user_input_promo = user_input_promo.strip()[:16]
    if not settings.is_publicly_deployed:
        logger.info("Local dev detected: Bypassing Stripe promo check.")
        return True
    get_stripe_key()
    try:
        promo = await run_in_threadpool(
            stripe.PromotionCode.list, code=user_input_promo, active=True
        )
        return len(promo.data) > 0
    except stripe.error.StripeError as e:
        logger.error("Error retrieving promocode %s" % e)
    return False
