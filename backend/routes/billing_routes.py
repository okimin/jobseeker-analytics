import logging
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


@router.get("/billing/promos/{promo_id}", response_model=bool)
@limiter.limit("10/hour")
async def check_valid_promo(request: Request, promo_id: str):
    try:
        is_valid = await check_promo_is_valid(promo_id)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid code")
        return {"status": "success"}
    except Exception as e:
        logger.error("check_valid_promo error %s" % e)
        raise HTTPException(status_code=500, detail="Something went wrong")
