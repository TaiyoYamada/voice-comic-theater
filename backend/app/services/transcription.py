"""文字起こしサービス層。設定に応じて adapter を選ぶ。"""

from __future__ import annotations

import logging
from pathlib import Path

from ..adapters.base import Transcriber
from ..adapters.dummy_transcriber import DummyTranscriber
from ..config import settings

log = logging.getLogger("vct.transcription")

_transcriber: Transcriber | None = None
_fallback_reason: str | None = None


def transcribe_fallback_reason() -> str | None:
    """whisper 指定なのに dummy になった理由（無ければ None）。/health で確認用。"""
    return _fallback_reason


def get_transcriber() -> Transcriber:
    """設定 TRANSCRIBE_BACKEND に応じた Transcriber を返す（生成は1回だけ）。"""
    global _transcriber, _fallback_reason
    if _transcriber is not None:
        return _transcriber

    backend = settings.transcribe_backend.lower()
    if backend == "whisper":
        # whisper が無ければ dummy にフォールバックして落とさない。
        try:
            import whisper  # noqa: F401

            from ..adapters.whisper_transcriber import WhisperTranscriber

            _transcriber = WhisperTranscriber()
        except Exception as e:
            _fallback_reason = f"{type(e).__name__}: {e}"
            log.warning("Whisper を初期化できないため dummy にフォールバックします: %s", _fallback_reason)
            _transcriber = DummyTranscriber()
    else:
        if backend != "dummy":
            log.warning("不明な TRANSCRIBE_BACKEND=%s。dummy を使います。", backend)
        _transcriber = DummyTranscriber()

    log.info("Transcriber: %s", _transcriber.name)
    return _transcriber


async def transcribe_wav(wav_path: Path) -> str:
    return await get_transcriber().transcribe(wav_path)
