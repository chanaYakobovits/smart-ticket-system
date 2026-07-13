import logging

logging.basicConfig(
    filename="app_security.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("security")