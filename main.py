import os
import stat
import pwd
import grp
import time
from typing import Dict 
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask("backend")

CORS(app)

def get_file_info(file_path: str, name=None) -> Dict[str, str]:
    try:
        # Get file status
        file_stat = os.stat(file_path)

        # Extract the metadata
        metadata = {
            'name': name if name else os.path.basename(file_path),
            'is_directory': stat.S_ISDIR(file_stat.st_mode),
            'permissions': stat.filemode(file_stat.st_mode),
            'links': file_stat.st_nlink,
            'owner': pwd.getpwuid(file_stat.st_uid).pw_name,
            'group': grp.getgrgid(file_stat.st_gid).gr_name,
            'size': file_stat.st_size,
            'modified_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_mtime)),
            'access_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_atime)),
            'change_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_ctime))
        }

        return metadata

    except FileNotFoundError:
        return {'error': 'File not found'}
    except PermissionError:
        return {'error': 'Permission denied'}
    except Exception as e:
        return {'error': str(e)}

@app.route("/fs/<path:path>")
def file_system(path: str):
    full_path = '/' + path
    try:
        # Check if the path is indeed a directory
        if not os.path.isdir(full_path):
            return jsonify(get_file_info(full_path))

        # List all files and directories in the directory
        metadata_list = []

        for item_name in os.listdir(full_path):
            item_path = os.path.join(full_path, item_name)
            metadata = get_file_info(item_path, item_name)
            metadata_list.append(metadata)

        return jsonify(metadata_list)

    except FileNotFoundError:
        return jsonify({'error': 'File not found'})
    except PermissionError:
        return jsonify({'error': 'Permission denied'})
    except Exception as e:
        return jsonify({'error': str(e)})
     
 
