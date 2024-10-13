import os

from flask import Flask, jsonify
from flask_cors import CORS
from requests import get
from dotenv import load_dotenv

from utils import get_file_info, convert_gh_repos, convert_gh_users, convert_repo_files

app = Flask("backend")
CORS(app)
load_dotenv()

GITHUB_API_URL = "https://api.github.com"
GITHUB_API_TOKEN = os.environ.get("GH_API_TOKEN", "")
GITHUB_API_HEADERS = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer: {GITHUB_API_TOKEN}",
    "X-Github-Api-Version": "2022-11-28",
}

@app.route("/fs/home/")
def get_users():
    res = get(f"{GITHUB_API_URL}/users", headers=GITHUB_API_HEADERS, timeout=2)
    if res.status_code not in (200, 304):
        return jsonify({'error': 'Problem fetching GitHub user information'})
    metadata_list = convert_gh_users(res.json())
    return jsonify(metadata_list)

@app.route("/fs/home/<string:username>")
def get_user(username: str):
    res = get(f"{GITHUB_API_URL}/users/{username}/repos", headers=GITHUB_API_HEADERS, timeout=2)
    res_json = res.json()
    if res.status_code not in (200, 304):
        return jsonify({'error': f'Problem fetching GitHub user \"{username}\": {res_json["message"]}'})
    metadata_list = convert_gh_repos(res_json)
    return jsonify(metadata_list)

@app.route("/fs/home/<string:username>/<string:repository>/", defaults={'subpath': ''})
@app.route("/fs/home/<string:username>/<string:repository>/<path:subpath>")
def get_repo(username: str, repository: str, subpath: str):
    res = get(f"{GITHUB_API_URL}/repos/{username}/{repository}/contents/{subpath}", headers=GITHUB_API_HEADERS, timeout=2)
    res_json = res.json()
    if res.status_code not in (200, 304):
        return jsonify({'error': f'Problem fetching file \"{username}\": {res_json["message"]}'})
    metadata_list = convert_repo_files(res_json, username)
    return metadata_list

@app.route("/fs/<path:path>")
def file_system(path: str):
    full_path = '/' + path
    try:
        if not os.path.isdir(full_path):
            return jsonify(get_file_info(full_path))

        # List of all files and directories in the directory
        metadata_list = []

        for item_name in os.listdir(full_path):
            item_path = os.path.join(full_path, item_name)
            metadata = get_file_info(item_path, item_name)
            metadata_list.append(metadata)

        return jsonify(metadata_list)

    except FileNotFoundError:
        return jsonify({'error': f'{full_path} not found'})
    except PermissionError:
        return jsonify({'error': 'Permission denied'})
    except Exception as e:
        return jsonify({'error': str(e)})
 
if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=8000)
