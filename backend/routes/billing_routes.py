import logging
from typing import Optional

from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from utils.config_utils import get_settings
from utils.billing_utils import check_promo_is_valid

settings = get_settings()

# Logger setup
logger = logging.getLogger(__name__)

# FastAPI router for file routes
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/billing/promos/{promo_id}")
@limiter.limit("10/hour")
async def check_valid_promo(request: Request, promo_id: str, email: Optional[str] = None):
    log_message = f"check_valid_promo {promo_id}"
    if email:
        log_message += f" for user {email}"
    logger.info(log_message)

    is_valid = False
    try:
        is_valid = await check_promo_is_valid(promo_id)
    except Exception as e:
        logger.error("check_valid_promo unexpected error %s" % e)
        raise HTTPException(status_code=500, detail="Something went wrong")

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid code")
    else:
        return HTTPException(status_code=200, detail="Valid code")
