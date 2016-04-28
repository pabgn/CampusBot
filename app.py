from flask import Flask, render_template, send_from_directory
app = Flask(__name__)

@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)


@app.route('/images/<path:path>')
def send_images(path):
    return send_from_directory('images', path)
        
@app.route("/")
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)