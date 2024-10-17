import os
import stat
import pwd
import grp
import time
from datetime import datetime, timezone
from random import randint
from typing import Callable, List, Any, Dict, Union, Optional

from models import Project, FileObj

def convert_datetime(time: str) -> str:
    dt_obj = datetime.strptime(time, "%Y-%m-%dT%H:%M:%SZ")
    return dt_obj.replace(tzinfo=timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

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

def get_file_info(file_path: str, name=None) -> FileObj | Dict[str, str]:
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
            'size': convert_bytes(file_stat.st_size),
            'modified_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_mtime)),
            'access_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_atime)),
            'change_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_ctime))
        }

        return metadata

    except FileNotFoundError:
        return {'error': f'{file_path} not found'}
    except PermissionError:
        return {'error': 'Permission denied'}
    except Exception as e:
        return {'error': str(e)}

def create_file(
    name: str, owner: str,
    *,
    is_directory: bool = False, 
    permissions: Optional[str] = None,
    links: int = 0, size: int = 0,
    group: Optional[str] = None,
    modified_time: Optional[datetime] = None, 
    access_time: Optional[datetime] = None,
    change_time: Optional[datetime] = None
) -> FileObj:
    permissions = permissions or 'rw-r--r--'
    permissions = ('d' if is_directory else '-') + permissions
    group = group or owner
    size_s = convert_bytes(size or randint(40, 100))
    modified_time = modified_time or datetime.now()
    access_time = access_time or modified_time
    change_time = change_time or access_time

    return FileObj(
        name=name,
        is_directory=is_directory,
        permissions=permissions,
        links=links,
        owner=owner,
        group=group,
        size=size_s,
        modified_time=modified_time.strftime('%Y-%m-%d %H:%M:%S'),
        access_time=access_time.strftime('%Y-%m-%d %H:%M:%S'),
        change_time=change_time.strftime('%Y-%m-%d %H:%M:%S')
    )

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

def convert_gh_repos(gh_repos: List[Any]) -> List[FileObj]:
    files: List[FileObj] = []
    for repo in gh_repos:
        link = repo.get('html_url')
        name = f"[**{repo['name']}**]({link})"
        modified_time = convert_datetime(repo['updated_at'])
        access_time = convert_datetime(repo['created_at'])
        metadata: FileObj = {
            'name': name,
            'is_directory': True,
            'permissions': 'drw-r--r--', # Change this to check permissions
            'links': 0,
            'owner': repo['owner']['login'],
            'group': repo['owner']['login'],
            'size': convert_bytes(repo['size']),
            'modified_time': modified_time,
            'access_time': access_time,
            'change_time': access_time,
        }
        files.append(metadata)
    return files

def convert_gh_users(gh_users: List[Any]) -> List[FileObj]:
    files: List[FileObj] = []
    for user in gh_users:
        link = user.get('html_url')
        name = f"[**{user['login']}**]({link})"
        curr_time = datetime.now(tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        metadata: FileObj = {
            'name': name,
            'is_directory': True,
            'permissions': 'drw-r--r--', # Change this to check permissions
            'links': 0,
            'owner': user['login'],
            'group': user['login'],
            'size': convert_bytes(4096),
            'modified_time': curr_time,
            'access_time': curr_time,
            'change_time': curr_time,
        }
        files.append(metadata)
    return files

def convert_repo_file(user: str) -> Callable[[Any], FileObj]:
    def convert(file: Any) -> FileObj:
        link = file.get('html_url')
        is_dir = file['type'] == 'dir'
        name = f"**{file['name']}**" if is_dir else file['name']
        link_name = f"[{name}]({link})"
        return create_file(link_name, user, is_directory=is_dir) 
    return convert

def convert_repo_files(obj: Union[List[Any], Any], user: str) -> List[FileObj]:
    if isinstance(obj, list):
        return list(map(convert_repo_file(user), obj))
    return [convert_repo_file(user)(obj)]
