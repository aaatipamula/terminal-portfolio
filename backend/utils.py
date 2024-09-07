from datetime import datetime, timezone
from random import randint
from typing import List

from models import Project, FileObj

def create_project_folder(projects: List[Project]) -> List[FileObj]:
    files: List[FileObj] = []
    for project in projects:
        link = project['link'] if project['link'].startswith('http') else 'https://github.com/' + project['link']
        name = f"[{project['name']}]({link})"
        curr_time = datetime.now(tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        metadata: FileObj = {
            'name': name,
            'is_directory': False,
            'permissions': '-rw-r--r--',
            'links': 0,
            'owner': 'aaatipamula',
            'group': 'aaatipamula',
            'size': str(randint(40, 80)) + 'B',
            'modified_time': curr_time,
            'access_time': curr_time,
            'change_time': curr_time,
        }
        files.append(metadata)
    return files

def convert_bytes(size_in_bytes: int) -> str:
    # Define size units in bytes
    units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    size = float(size_in_bytes)
    unit_index = 0

    # Loop to divide size into appropriate unit
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1

    # Format the result to have a maximum of 1 digit after the decimal point
    return f"{size:.1f}{units[unit_index]}"

