#!/usr/bin/env bash
# GAS（サーバーレジストリ）の動作確認スクリプト。
#
#   使い方:
#     bash scripts/test-gas.sh "https://script.google.com/macros/s/XXXX/exec"
#
# register → list → assign → heartbeat → list の順に叩き、
# レジストリのロジックが期待どおり動くかを確認する。

set -euo pipefail

GAS_URL="${1:-}"
if [ -z "$GAS_URL" ]; then
  echo "使い方: bash scripts/test-gas.sh <GAS_URLの/exec>"
  exit 1
fi

SID="test-$(date +%s)"
echo "== GAS_URL: $GAS_URL"
echo "== テスト用 serverId: $SID"
echo
# 注意: GAS の POST は 302 で googleusercontent にリダイレクトされ、
#       追うと HTML が返ることがある（正常）。動作確認は list の差分で判断する。
post() { curl -sS -L -o /dev/null -w "  -> HTTP %{http_code}\n" "$@"; }

echo "--- 1) register（ダミーサーバーを登録）---"
post -X POST "$GAS_URL?action=register" \
  -H "Content-Type: application/json" \
  -d "{\"serverId\":\"$SID\",\"color\":\"red\",\"label\":\"テスト赤\",\"apiUrl\":\"https://example.com\",\"capacity\":2}"

echo "--- 2) list（登録された？ assignedCount=0 / enabled=true / lastSeen 更新）---"
curl -sS -L "$GAS_URL?action=list"
echo; echo

echo "--- 3) assign（assignedCount が 1 になる）---"
post -X POST "$GAS_URL?action=assign&serverId=$SID"

echo "--- 4) heartbeat（lastSeen が更新される）---"
post -X POST "$GAS_URL?action=heartbeat" \
  -H "Content-Type: application/json" \
  -d "{\"serverId\":\"$SID\"}"

echo "--- 5) list（assignedCount=1 になっているか確認）---"
curl -sS -L "$GAS_URL?action=list"
echo; echo

echo "✅ 完了。Google Sheets の servers シートにも $SID の行ができているはず。"
echo "   テスト行は手で消すか、?action=disable で無効化してください。"
