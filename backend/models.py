from typing import TypedDict

class FileObj(TypedDict):
    name: str
    is_directory: bool
    permissions: str
    links: int
    owner: str
    group: str
    size: int
    modified_time: str
    access_time: str
    change_time: str

class Project(TypedDict):
    name: str
    link: str
