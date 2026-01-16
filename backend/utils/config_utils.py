from functools import lru_cache
import config
import stripe

@lru_cache
def get_settings():
    return config.ConfigSettings()

@lru_cache
def get_stripe_key():
    settings = get_settings()
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return settings.STRIPE_SECRET_KEY
