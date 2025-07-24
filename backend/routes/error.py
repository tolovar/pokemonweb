


import logging
import traceback

from flask import Response, jsonify
from backend import app
from werkzeug.exceptions import HTTPException


@app.errorhandler(Exception)
def handle_exception(e) -> tuple[Response, int]:
    if isinstance(e, HTTPException):
        code = e.code if e.code is not None else 500
        logging.error(f"HTTPException: {e.description} (codice: {code})")
        return jsonify({"success": False, "error": e.description}), code
    logging.error(f"Eccezione non gestita: {e}\\n{traceback.format_exc()}")
    return jsonify({"success": False, "error": "Errore interno inatteso"}), 500