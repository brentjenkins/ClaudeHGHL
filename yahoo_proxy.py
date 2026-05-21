#!/usr/bin/env python3
"""
Yahoo Fantasy OAuth Proxy for NHL Roster Tracker
-------------------------------------------------
Run once:  python3 yahoo_proxy.py
Then click "Sync Yahoo" in the roster tracker.

Requires: pip install requests flask flask-cors
"""

import json, os, time, threading, webbrowser, ssl, subprocess, sys, traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, urlencode
import requests
from flask import Flask, jsonify, Response
from flask_cors import CORS

# ── Config ────────────────────────────────────────────────────────────────────
# Load credentials from a .env file if present, then fall back to environment variables.
_env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(_env_file):
    with open(_env_file) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                os.environ.setdefault(_k.strip(), _v.strip())

CLIENT_ID = os.environ.get("YAHOO_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("YAHOO_CLIENT_SECRET", "")

if not CLIENT_ID or not CLIENT_SECRET:
    sys.exit(
        "❌  YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET must be set.\n"
        "    Create a .env file next to yahoo_proxy.py with:\n\n"
        "        YAHOO_CLIENT_ID=your_client_id\n"
        "        YAHOO_CLIENT_SECRET=your_client_secret\n\n"
        "    Or export them as environment variables before running."
    )
LEAGUE_KEY = os.environ.get("YAHOO_LEAGUE_KEY", "465.l.97882")
REDIRECT_URI = "https://localhost:8100/callback"
TOKEN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".yahoo_tokens.json")
CERT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".localhost_cert.pem")
KEY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".localhost_key.pem")
PROXY_PORT = 8099
CALLBACK_PORT = 8100

YAHOO_AUTH_URL = "https://api.login.yahoo.com/oauth2/request_auth"
YAHOO_TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token"
YAHOO_API_BASE = "https://fantasysports.yahooapis.com/fantasy/v2"


# ── SSL cert generation ───────────────────────────────────────────────────────
def ensure_cert():
    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        return
    print("🔐  Generating self-signed SSL cert for localhost…")
    subprocess.run([
        "openssl", "req", "-x509", "-newkey", "rsa:2048",
        "-keyout", KEY_FILE, "-out", CERT_FILE,
        "-days", "825", "-nodes",
        "-subj", "/CN=localhost",
        "-addext", "subjectAltName=IP:127.0.0.1,DNS:localhost"
    ], check=True, capture_output=True)
    print("✅  Cert generated.")


# ── Token storage ─────────────────────────────────────────────────────────────
def load_tokens():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            return json.load(f)
    return {}


def save_tokens(tokens):
    with open(TOKEN_FILE, "w") as f:
        json.dump(tokens, f, indent=2)


def token_expired(tokens):
    return time.time() > tokens.get("expires_at", 0) - 60


def refresh_access_token(tokens):
    print("🔄  Refreshing Yahoo access token…")
    resp = requests.post(YAHOO_TOKEN_URL, data={
        "grant_type": "refresh_token",
        "refresh_token": tokens["refresh_token"],
        "redirect_uri": REDIRECT_URI,
    }, auth=(CLIENT_ID, CLIENT_SECRET))
    resp.raise_for_status()
    data = resp.json()
    tokens["access_token"] = data["access_token"]
    tokens["refresh_token"] = data.get("refresh_token", tokens["refresh_token"])
    tokens["expires_at"] = time.time() + data.get("expires_in", 3600)
    save_tokens(tokens)
    print("✅  Token refreshed.")
    return tokens


_token_lock = threading.Lock()


def get_valid_token():
    with _token_lock:
        tokens = load_tokens()
        if not tokens:
            return None
        if token_expired(tokens):
            tokens = refresh_access_token(tokens)
        return tokens["access_token"]


# ── OAuth callback server ─────────────────────────────────────────────────────
auth_code_holder = {}


class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        qs = parse_qs(urlparse(self.path).query)
        code = qs.get("code", [None])[0]
        if code:
            auth_code_holder["code"] = code
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"""
                <html><body style="font-family:sans-serif;padding:2rem;text-align:center;background:#f9f9f9">
                <div style="max-width:400px;margin:4rem auto;background:#fff;padding:2rem;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08)">
                <div style="font-size:48px">&#10003;</div>
                <h2 style="color:#185FA5;margin:.5rem 0">Authorized!</h2>
                <p style="color:#666">You can close this tab and return to the roster tracker.<br>Click <strong>Sync Yahoo</strong> to load your league.</p>
                </div></body></html>
            """)
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Missing code.")

    def log_message(self, *args):
        pass


def exchange_code(code):
    resp = requests.post(YAHOO_TOKEN_URL, data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }, auth=(CLIENT_ID, CLIENT_SECRET))
    resp.raise_for_status()
    data = resp.json()
    tokens = {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "expires_at": time.time() + data.get("expires_in", 3600),
    }
    save_tokens(tokens)
    return tokens


def do_oauth_flow():
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "fspt-r",
    }
    auth_url = YAHOO_AUTH_URL + "?" + urlencode(params)
    print(f"\n🌐  Opening Yahoo authorization in your browser…")
    print(f"    If it doesn't open automatically, visit:\n    {auth_url}\n")
    webbrowser.open(auth_url)

    # HTTPS callback server
    server = HTTPServer(("localhost", CALLBACK_PORT), CallbackHandler)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
    server.socket = ctx.wrap_socket(server.socket, server_side=True)
    server.timeout = 120

    print("⏳  Waiting for Yahoo callback (up to 2 minutes)…")
    print(f"    ⚠️  Your browser may warn about the self-signed cert at the callback URL.")
    print(f"    If it does: click Advanced → Proceed to localhost (unsafe)\n")

    while "code" not in auth_code_holder:
        server.handle_request()
    server.server_close()

    code = auth_code_holder["code"]
    print("🔑  Got authorization code — exchanging for tokens…")
    exchange_code(code)
    print("✅  Tokens saved! You're all set.\n")


# ── Yahoo API helper ──────────────────────────────────────────────────────────
def yahoo_get(path, token):
    sep = "&" if "?" in path else "?"
    url = YAHOO_API_BASE + path + sep + "format=json"
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})
    resp.raise_for_status()
    return resp.json()


# ── Flask proxy ───────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=["*"])


@app.route("/status")
def status():
    tokens = load_tokens()
    if not tokens:
        return jsonify({"authenticated": False})
    return jsonify({"authenticated": True, "expired": token_expired(tokens)})


@app.route("/auth")
def auth():
    threading.Thread(target=do_oauth_flow, daemon=True).start()
    return jsonify({"ok": True, "message": "OAuth flow started — check your browser."})


@app.route("/league")
def league():
    token = get_valid_token()
    if not token:
        return jsonify({"error": "Not authenticated."}), 401
    try:
        data = yahoo_get(f"/league/{LEAGUE_KEY}", token)
        return jsonify({"ok": True, "league": data["fantasy_content"]["league"][0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/rosters")
def rosters():
    token = get_valid_token()
    if not token:
        return jsonify({"error": "Not authenticated."}), 401
    try:
        data = yahoo_get(f"/league/{LEAGUE_KEY}/teams/roster/players", token)
        teams_raw = data["fantasy_content"]["league"][1]["teams"]
        result = []

        # Teams are keyed "0", "1", ... plus a "count" key
        team_indices = [k for k in teams_raw.keys() if k != "count"]
        for idx in team_indices:
            team = teams_raw[idx]["team"]
            # team[0] is a list of metadata dicts; find the one with "name"
            team_meta = team[0]
            team_name = next((m["name"] for m in team_meta if isinstance(m, dict) and "name" in m), f"Team {idx}")

            # team[1] is {"roster": ...}
            roster_data = team[1]["roster"]
            # roster_data may be a list or dict
            if isinstance(roster_data, list):
                players_raw = next(r["players"] for r in roster_data if isinstance(r, dict) and "players" in r)
            else:
                players_raw = next(
                    v["players"] for k, v in roster_data.items() if isinstance(v, dict) and "players" in v)
            player_indices = [k for k in players_raw.keys() if k != "count"]

            for pidx in player_indices:
                p = players_raw[pidx]["player"]
                # p[0] is list of metadata dicts, p[1] is selected_position
                meta = p[0]

                full_name = next((m.get("full_name") or m.get("name", {}).get("full", "")
                                  for m in meta if isinstance(m, dict) and ("full_name" in m or "name" in m)), "")

                nhl_team = next((m.get("editorial_team_abbr", "—").upper()
                                 for m in meta if isinstance(m, dict) and "editorial_team_abbr" in m), "—")

                positions = next((m.get("eligible_positions", [])
                                  for m in meta if isinstance(m, dict) and "eligible_positions" in m), [])
                pos = positions[0].get("position", "C") if positions else "C"

                if full_name:
                    result.append({"name": full_name, "nhlTeam": nhl_team, "pos": pos, "fantasyTeam": team_name})

        return jsonify({"ok": True, "players": result})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/transactions")
def transactions():
    token = get_valid_token()
    if not token:
        return jsonify({"error": "Not authenticated."}), 401
    try:
        data = yahoo_get(f"/league/{LEAGUE_KEY}/transactions;type=add,drop,trade;count=25", token)
        tx_raw = data["fantasy_content"]["league"][1].get("transactions", {})
        result = []
        tx_indices = [k for k in tx_raw.keys() if k != "count"]
        for i in tx_indices:
            tx = tx_raw[i].get("transaction")
            if not tx: continue
            meta = tx[0]
            ts = int(meta.get("timestamp", 0))
            date_str = time.strftime("%-m/%-d", time.localtime(ts)) if ts else ""
            players_raw = tx[1].get("players", {})
            players_list = []
            p_indices = [k for k in players_raw.keys() if k != "count"]
            for j in p_indices:
                pp = players_raw[j].get("player")
                if not pp: continue
                p_meta = pp[0]
                name = next((m.get("full_name") or m.get("name", {}).get("full", "")
                             for m in p_meta if isinstance(m, dict) and ("full_name" in m or "name" in m)), "")
                tx_data = pp[1].get("transaction_data", {})
                ptype = tx_data[0].get("type", meta.get("type", "")) if isinstance(tx_data,
                                                                                   list) and tx_data else meta.get(
                    "type", "")
                if name:
                    players_list.append({"name": name, "type": ptype})
            if players_list:
                result.append({"date": date_str, "type": meta.get("type", ""), "players": players_list, "ts": ts})
        result.sort(key=lambda x: x["ts"], reverse=True)
        return jsonify({"ok": True, "transactions": result})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/")
def index():
    html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "roster_tracker.html")
    if os.path.exists(html_path):
        with open(html_path) as f:
            return Response(f.read(), mimetype="text/html")
    return Response("<h2>roster_tracker.html not found — place it in the same folder as yahoo_proxy.py</h2>",
                    mimetype="text/html")


# ── Team lists ────────────────────────────────────────────────────────────────
# Used for PuckPedia cap-hit scraping (ARI kept for legacy depth-chart pages)
NHL_TEAMS = [
    "ANA", "ARI", "BOS", "BUF", "CAR", "CBJ", "CGY", "CHI", "COL", "DAL",
    "DET", "EDM", "FLA", "LAK", "MIN", "MTL", "NJD", "NSH", "NYI", "NYR",
    "OTT", "PHI", "PIT", "SEA", "SJS", "STL", "TBL", "TOR", "UTA", "VAN",
    "VGK", "WSH", "WPG"
]
# ARI no longer exists in the NHL API (relocated → UTA)
NHL_API_TEAMS = [t for t in NHL_TEAMS if t != "ARI"]


# NHL positionCode → app abbreviation
_POS_MAP = {"C": "C", "L": "LW", "R": "RW", "D": "D", "G": "G"}


def _pos_group(pos):
    """Map any position abbreviation to F / D / G."""
    if pos == "D":
        return "D"
    if pos == "G":
        return "G"
    return "F"


# ── NHL roster status ─────────────────────────────────────────────────────────
@app.route("/nhlrosters")
def nhl_rosters():
    """Returns a dict keyed by lowercased full name for all players on active NHL rosters."""
    active = {}
    errors = []

    def fetch_roster(team):
        url = f"https://api-web.nhle.com/v1/roster/{team}/current"
        for attempt in range(4):
            resp = requests.get(url, timeout=10)
            if resp.status_code == 429:
                time.sleep(2 ** attempt)  # 1, 2, 4, 8 s
                continue
            resp.raise_for_status()
            result = {}
            for group in ("forwards", "defensemen", "goalies"):
                for p in resp.json().get(group, []):
                    first = p.get("firstName", {}).get("default", "")
                    last = p.get("lastName", {}).get("default", "")
                    full = f"{first} {last}".strip()
                    pos = _POS_MAP.get(p.get("positionCode", ""), "C")
                    if full:
                        key = f"{full.lower()}_{_pos_group(pos)}"
                        result[key] = {"name": full, "nhlTeam": team, "pos": pos}
            return result
        resp.raise_for_status()  # all retries exhausted

    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(fetch_roster, team): team for team in NHL_API_TEAMS}
        for future in as_completed(futures):
            team = futures[future]
            try:
                active.update(future.result())
            except Exception as e:
                errors.append(f"{team}: {str(e)}")
                traceback.print_exc()

    return jsonify({"ok": True, "active": active, "count": len(active), "errors": errors})


# ── Cap hits scraper ──────────────────────────────────────────────────────────


def scrape_team_caps(team_code):
    import re
    url = f"https://depth-charts.puckpedia.com/?hideHeader=true&hideFooter=true&team={team_code}"
    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
    resp.raise_for_status()
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(resp.text, "html.parser")
    players = {}

    # Each player tile is an <a> tag with href to puckpedia.com/player/...
    # It contains the last name and a dollar amount like $12.50M or $950K
    for a in soup.find_all("a", href=re.compile(r"puckpedia\.com/player/")):
        text = a.get_text(" ", strip=True)
        # Extract cap hit — looks like $12.50M or $950K or $1.48M
        cap_match = re.search(r'\$([0-9,.]+)(M|K)', text)
        if not cap_match:
            continue
        cap_val = float(cap_match.group(1).replace(",", ""))
        if cap_match.group(2) == "K":
            cap_val = cap_val / 1000
        # Extract last name and position from text before the cap hit figure
        name_part = re.sub(r'YR\s+\d+.*?\)', '', text)  # remove contract year info
        name_part = re.sub(r'\$[0-9,.]+[MK].*', '', name_part)  # remove cap hit onward
        name_part = re.sub(r'\d+[⋅·]', '', name_part)  # remove age dots

        # Position sits at end of name_part (e.g. "C", "D", "LW", "G")
        pos_m = re.search(r'\b(C|LW|RW|L|R|D|G|F)\b\s*$', name_part.strip())
        raw_pos = pos_m.group(1) if pos_m else ''
        pg = _pos_group(raw_pos) if raw_pos else 'F'

        name_part = re.sub(r'[CLRWDGF|]+\s*$', '', name_part).strip()
        parts = name_part.split()
        if parts:
            last_name = parts[-1]
            if len(last_name) > 2:  # skip junk
                key = f"{last_name.lower()}_{pg}"
                players[key] = {"lastName": last_name, "cap": round(cap_val, 4), "team": team_code}

    return players


@app.route("/caphits")
def caphits():
    all_players = {}
    errors = []

    def fetch_team(team):
        time.sleep(0.2)  # stagger requests per worker to be polite
        return team, scrape_team_caps(team), None

    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(fetch_team, team): team for team in NHL_TEAMS}
        for future in as_completed(futures):
            team = futures[future]
            try:
                _, data, _ = future.result()
                all_players.update(data)
                print(f"  ✓ {team}: {len(data)} players")
            except Exception as e:
                errors.append(f"{team}: {str(e)}")
                print(f"  ✗ {team}: {e}")

    print(f"Cap hits done: {len(all_players)} players, {len(errors)} errors")
    return jsonify({"ok": True, "players": all_players, "errors": errors, "count": len(all_players)})


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  NHL Roster Tracker — Yahoo Fantasy Proxy")
    print("=" * 55)

    ensure_cert()

    tokens = load_tokens()
    if not tokens or token_expired(tokens):
        print("\n🔐  No valid token — starting OAuth flow…")
        do_oauth_flow()
    else:
        print("\n✅  Already authenticated.")

    print(f"\n🚀  Proxy running at http://localhost:{PROXY_PORT}")
    print(f"    Opening roster tracker in your browser…")
    print(f"    League: {LEAGUE_KEY}")
    print(f"    Press Ctrl+C to stop.\n")
    threading.Timer(1.5, lambda: webbrowser.open(f"http://localhost:{PROXY_PORT}")).start()
    app.run(port=PROXY_PORT, debug=False)