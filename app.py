from pathlib import Path

from flask import Flask, render_template, send_from_directory


BASE_DIR = Path(__file__).resolve().parent

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "Templates"),
    static_folder=str(BASE_DIR / "static"),
    static_url_path="/static",
)


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/crypto_data.csv")
def crypto_data():
    return send_from_directory(BASE_DIR, "crypto_data.csv", mimetype="text/csv")


@app.get("/health")
def health():
    return {"status": "ok", "service": "CryptoTrack"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
