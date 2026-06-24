# 03. Colab でバックエンドを起動する方法

1台の Colab = 1サーバー。本番では 5〜10台を開きます（台数は固定不要）。

---

## 前提

- GAS をデプロイ済みで `GAS_URL`(/exec) がある（[04-gas-sheets.md](04-gas-sheets.md)）。
- リポジトリが GitHub などから `git clone` できる（private の場合は認証が必要なので public 推奨）。
- 公開トンネルを選ぶ:
  - **Cloudflare Quick Tunnel（本番おすすめ）**: 無料・アカウント/鍵/ドメイン不要・複数台同時OK・警告ページ無し。`TUNNEL=cloudflare`
  - **ngrok（手元の確認向き）**: 1アカウント＝同時1トンネル。`TUNNEL=ngrok` ＋ authtoken が必要。

> **使い分けの目安**: 本番（5〜10台）は Cloudflare、開発中に手元の1台を iPad 確認するときは ngrok。
> GAS が URL を仲介するので、どちらに変えても **フロントは無修正** です。

---

## 手順（notebook を使う場合）

`colab/start_backend.ipynb` を Colab で開き、上から順に実行します。

### セル1: リポジトリ取得

```python
!git clone https://github.com/<YOUR_NAME>/voice-comic-theater.git
%cd /content/voice-comic-theater
```

### セル2: 設定（秘密情報はシークレットから）

Colab 左の 🔑（シークレット）に少なくとも `GAS_URL` を登録します（`TUNNEL=ngrok` のときだけ `NGROK_AUTHTOKEN` も）。
登録後、`userdata.get(...)` を実行すると「このノートブックからアクセスを許可しますか？」と出るので **「許可」** します（ノートブックごとに1回）。

```python
import os
from google.colab import userdata

os.environ['GAS_URL'] = userdata.get('GAS_URL')

# 公開トンネル: 本番は 'cloudflare'（鍵不要・複数台OK）。手元のngrokを使うなら 'ngrok'。
os.environ['TUNNEL'] = 'cloudflare'
if os.environ['TUNNEL'] == 'ngrok':
    os.environ['NGROK_AUTHTOKEN'] = userdata.get('NGROK_AUTHTOKEN')

os.environ['SERVER_ID']    = 'colab-1'   # 台ごとに変える
os.environ['SERVER_COLOR'] = 'red'       # 台ごとに変える
os.environ['SERVER_LABEL'] = '赤サーバー'
os.environ['CAPACITY']     = '2'         # 1台 1〜2人
```

> **トークン等をコードに直書きしないこと。** 必ず環境変数（シークレット）から渡します。
> Cloudflare Quick Tunnel は鍵・アカウントが不要なので、登録するシークレットは `GAS_URL` だけで済みます。

### セル3: 起動

```python
%run colab/colab_runner.py
```

`colab_runner.py` が自動で次を実行します:

1. `backend/requirements.txt` をインストール
2. FastAPI を別スレッドで起動（`uvicorn`）
3. トンネルでHTTPS公開URLを発行（`TUNNEL` に応じて Cloudflare か ngrok）
   - Cloudflare の場合は `cloudflared` を自動ダウンロードして `*.trycloudflare.com` を発行
4. そのURLを GAS に `register`
5. 30秒ごとに GAS へ `heartbeat`（`lastSeen` 更新）

このセルは **実行したまま** にしておきます（止めるとサーバーが落ちます）。

---

## 10台分の色/ID 早見表

| ID | color | label |
|----|-------|-------|
| colab-1 | red | 赤サーバー |
| colab-2 | blue | 青サーバー |
| colab-3 | green | 緑サーバー |
| colab-4 | yellow | 黄サーバー |
| colab-5 | purple | 紫サーバー |
| colab-6 | orange | オレンジサーバー |
| colab-7 | pink | ピンクサーバー |
| colab-8 | cyan | 水色サーバー |
| colab-9 | brown | 茶色サーバー |
| colab-10 | black | 黒サーバー |

色キーは `frontend/src/lib/colors.ts` と一致させること。

---

## トンネルの選び方（Cloudflare / ngrok）

`TUNNEL` 環境変数で切り替えます。GAS が URL を仲介するので、どちらでも **フロントは無修正**。

### Cloudflare Quick Tunnel（本番おすすめ）

```python
os.environ['TUNNEL'] = 'cloudflare'   # GAS_URL だけ登録すればOK（鍵・アカウント不要）
```

- `colab_runner.py` が `cloudflared` を自動ダウンロードし、`https://〇〇.trycloudflare.com` を発行 → GAS に登録。
- **無料で複数台同時OK**。ngrok の「1アカウント1トンネル」制限を回避できる＝5〜10台に向く。
- ngrok のような警告ページが出ないため、`<audio>` での音声再生も素直に通る。
- 注意: Quick Tunnel は無保証（テスト用）。まれに切断され、再接続で URL が変わる。
  → アプリ側が `/health` 失敗を検知して自動で別 Colab へ再割り当てするので復旧可能。

#### 手元で Cloudflare を試す（任意）

```bash
# Mac などで（cloudflared をインストール後）
cloudflared tunnel --url http://localhost:8000
# 出力される https://〇〇.trycloudflare.com が公開URL
```

### ngrok（手元の確認向き）

```python
os.environ['TUNNEL'] = 'ngrok'
os.environ['NGROK_AUTHTOKEN'] = userdata.get('NGROK_AUTHTOKEN')  # 必須
```

- 1アカウント＝同時1トンネル。開発中に手元の1台を iPad で確認する用途に向く。
- 複数台必要な本番では、アカウントを台数ぶん分けるか有料プランが必要。

---

## Whisper / QwenTTS への差し替え

ダミーから本実装に切り替えるには、Colab のセル2に追記:

```python
os.environ['TRANSCRIBE_BACKEND'] = 'whisper'   # 文字起こしを Whisper に
os.environ['WHISPER_MODEL']      = 'base'
os.environ['TTS_BACKEND']        = 'qwen'       # 音声生成を QwenTTS に
```

そして:

- **Whisper**: `backend/requirements.txt` の `faster-whisper`（または `openai-whisper`）を有効化。
  実装は `backend/app/adapters/whisper_transcriber.py`（すでにロード＆推論の雛形あり）。
- **QwenTTS**: `backend/app/adapters/qwen_tts.py` の `_load()` と `synthesize()` を実装。
  `transformers` / `torch` / `soundfile` などを requirements に追加。
  GPU ランタイム（メニュー > ランタイム > ランタイムのタイプを変更 > GPU）を推奨。

サービス層（`services/transcription.py`・`services/tts.py`）が環境変数で adapter を選ぶので、
**route やフロントは一切変更不要**です。

---

## 同時生成の制御

1つの Colab では `asyncio.Lock`（`backend/app/locks.py`）により
**音声生成が同時に複数走らないよう**になっています（1件ずつ順番に処理）。
2人で1台を共有しても、生成は順番待ちになるだけで競合しません。
