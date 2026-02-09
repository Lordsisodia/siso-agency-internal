# iPhone Notifications for Agents (No Telegram)

Pick one option.

## Option A: Pushover (recommended)

1) Install the Pushover iOS app.
2) Create an “application” in Pushover to get an app token, and get your user key.
3) Create local config (gitignored):

```bash
mkdir -p ./.blackbox/.local
cat > ./.blackbox/.local/pushover.md <<'EOF'
app_token: ***
user_key: ***
EOF
```

4) Send a test ping:

```bash
./.blackbox/scripts/notify-pushover.sh "[Deep Research] Test ping"
```

## Option B: Pushcut (powerful + automation)

1) Install Pushcut on iPhone.
2) Create a notification definition in Pushcut (e.g. name: `deep-research`).
3) Copy your webhook secret from Pushcut and configure:

```bash
mkdir -p ./.blackbox/.local
cat > ./.blackbox/.local/pushcut.md <<'EOF'
secret: ***
notification: deep-research
EOF
```

4) Send a test ping:

```bash
./.blackbox/scripts/notify-pushcut.sh "[Deep Research] Test ping"
```
