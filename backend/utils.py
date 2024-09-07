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
            'size': randint(40, 70),
            'modified_time': curr_time,
            'access_time': curr_time,
            'change_time': curr_time,
        }
        files.append(metadata)
    return files

