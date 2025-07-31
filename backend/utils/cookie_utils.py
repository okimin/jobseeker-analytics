from fastapi import Response
from utils.config_utils import get_settings
import logging

# Logger setup
logger = logging.getLogger(__name__)
settings = get_settings()


def set_conditional_cookie(
    response: Response,
    key: str,
    value: str,
    max_age: int = 3600,  # 1 hour
    path: str = "/",
    httponly: bool = True,
):
    """Helper function to set cookies with environment-appropriate settings"""
    cookie_params = {
        "key": key,
        "value": value,
        "max_age": max_age,
        "path": path,
        "httponly": httponly,
    }

    # Add environment-specific parameters
    if settings.is_publicly_deployed:
        cookie_params.update(
            {"domain": settings.ORIGIN, "secure": True, "samesite": "Strict"}
        )
    else:
        cookie_params.update({"secure": False, "samesite": "Lax"})

    # Apply cookie prefixes for additional security
    if cookie_params["secure"]:
        if cookie_params["path"] == "/" and "domain" not in cookie_params:
            cookie_params["key"] = f"__Host-{cookie_params['key']}"
        else:
            cookie_params["key"] = f"__Secure-{cookie_params['key']}"

    # Debug logging
    logging.info(f"Setting cookie with parameters: {cookie_params}")
    logging.info(f"settings.ORIGIN: {settings.ORIGIN}")
    logging.info(f"settings.is_publicly_deployed: {settings.is_publicly_deployed}")
    logging.info(f"settings.APP_URL: {settings.APP_URL}")
    logging.info(f"settings.API_URL: {settings.API_URL}")

    response.set_cookie(**cookie_params)
    return response
