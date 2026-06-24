"""
Colab 上で FastAPI バックエンドを起動し、ngrok で公開して GAS に登録する。

Colab のノートブック最後のセルで実行する想定:

    !git clone https://github.com/<you>/voice-comic-theater.git
    %cd voice-comic-theater
    # 秘密情報は Colab の「シークレット」または os.environ で渡す（直書きしない）
    import os
    os.environ["NGROK_AUTHTOKEN"] = "..."   # 例: userdata.get('NGROK_AUTHTOKEN')
    os.environ["GAS_URL"]         = "https://script.google.com/macros/s/XXXX/exec"
    os.environ["SERVER_ID"]       = "colab-1"
    os.environ["SERVER_COLOR"]    = "red"
    os.environ["SERVER_LABEL"]    = "赤サーバー"
    os.environ["CAPACITY"]        = "2"
    %run colab/colab_runner.py

設定はすべて環境変数から読む（トークン等をコードに直書きしない）。
"""

from __future__ import annotations

import os
import subprocess
import sys
import threading
import time

import requests

# ---- 設定（すべて環境変数から）-------------------------------------------
NGROK_AUTHTOKEN = os.environ.get("NGROK_AUTHTOKEN", "")
GAS_URL = os.environ.get("GAS_URL", "")
SERVER_ID = os.environ.get("SERVER_ID", "colab-1")
SERVER_COLOR = os.environ.get("SERVER_COLOR", "blue")
SERVER_LABEL = os.environ.get("SERVER_LABEL", "Colabサーバー")
CAPACITY = int(os.environ.get("CAPACITY", "2"))
PORT = int(os.environ.get("PORT", "8000"))
HEARTBEAT_SEC = int(os.environ.get("HEARTBEAT_SEC", "30"))

# バックエンドにも識別情報を渡す（/health で返す用）
os.environ.setdefault("SERVER_ID", SERVER_ID)
os.environ.setdefault("SERVER_COLOR", SERVER_COLOR)
os.environ.setdefault("SERVER_LABEL", SERVER_LABEL)


def install_dependencies() -> None:
    print("[1/5] 依存ライブラリをインストール中…")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-q", "-r", "backend/requirements.txt"],
        check=True,
    )


def start_backend() -> threading.Thread:
    print("[2/5] FastAPI を起動中…")
    # backend ディレクトリを import パスに追加して uvicorn をプログラム起動
    sys.path.insert(0, os.path.abspath("backend"))

    def _serve() -> None:
        import uvicorn

        uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, log_level="info")

    t = threading.Thread(target=_serve, daemon=True)
    t.start()
    # 起動待ち
    for _ in range(30):
        try:
            if requests.get(f"http://127.0.0.1:{PORT}/health", timeout=2).ok:
                break
        except requests.RequestException:
            time.sleep(1)
    return t


def open_ngrok() -> str:
    print("[3/5] ngrok で外部公開中…")
    from pyngrok import conf, ngrok

    if NGROK_AUTHTOKEN:
        conf.get_default().auth_token = NGROK_AUTHTOKEN
    tunnel = ngrok.connect(PORT, "http")
    url = tunnel.public_url.replace("http://", "https://")
    print(f"   公開URL: {url}")
    return url


def register_to_gas(api_url: str) -> None:
    print("[4/5] GAS にサーバーを登録中…")
    if not GAS_URL:
        print("   GAS_URL 未設定のため登録をスキップします。")
        return
    try:
        res = requests.post(
            GAS_URL,
            params={"action": "register"},
            json={
                "serverId": SERVER_ID,
                "color": SERVER_COLOR,
                "label": SERVER_LABEL,
                "apiUrl": api_url,
                "capacity": CAPACITY,
            },
            timeout=15,
        )
        print(f"   register: HTTP {res.status_code} {res.text[:120]}")
    except requests.RequestException as e:
        print(f"   register に失敗: {e}")


def heartbeat_loop(api_url: str) -> None:
    print(f"[5/5] heartbeat を {HEARTBEAT_SEC} 秒ごとに送信します（停止するまで継続）。")
    while True:
        time.sleep(HEARTBEAT_SEC)
        if not GAS_URL:
            continue
        try:
            requests.post(
                GAS_URL,
                params={"action": "heartbeat"},
                json={"serverId": SERVER_ID, "apiUrl": api_url},
                timeout=10,
            )
        except requests.RequestException as e:
            print(f"   heartbeat に失敗: {e}")


def main() -> None:
    install_dependencies()
    start_backend()
    api_url = open_ngrok()
    register_to_gas(api_url)
    print("\n✅ 準備完了。このセルは動かしたままにしてください。")
    print(f"   serverId={SERVER_ID} color={SERVER_COLOR} url={api_url}\n")
    try:
        heartbeat_loop(api_url)
    except KeyboardInterrupt:
        print("停止しました。")


if __name__ == "__main__":
    main()
