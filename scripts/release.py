"""Validate skill sources and create deterministic, minimal distribution archives."""

import argparse
import hashlib
import os
import re
import sys
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml


ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"
SKIP_DIRS = {".git", ".venv", "node_modules", "dist", "__pycache__", ".codex", ".agents", ".pnpm-store", ".pnpm-cache"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def skill_files(folder):
    files = []
    for path in sorted(folder.rglob("*")):
        require(not path.is_symlink(), f"Symlinks are not packaged: {path}")
        if path.is_file():
            require(path.suffix in {".md", ".yaml"}, f"Unexpected skill asset: {path}")
            require(not any(part.startswith(".") for part in path.relative_to(folder).parts), f"Hidden skill file: {path}")
            files.append(path)
    return files


def check():
    folders = sorted(path for path in SKILLS.iterdir() if path.is_dir())
    require(bool(folders), "No skills found.")
    for folder in folders:
        require(not folder.is_symlink(), f"Skill directory is a symlink: {folder}")
        source = folder / "SKILL.md"
        require(source.is_file(), f"Missing {source}")
        text = source.read_text(encoding="utf-8-sig")
        match = re.match(r"\A---\n(.*?)\n---(?:\n|$)", text, re.S)
        require(match is not None, f"Missing YAML frontmatter: {source}")
        meta = yaml.safe_load(match.group(1))
        require(isinstance(meta, dict), f"Frontmatter must be a mapping: {source}")
        name = meta.get("name")
        require(isinstance(name, str) and re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name) and len(name) <= 64, f"Invalid skill name: {source}")
        require(name == folder.name, f"Skill name must match its folder: {source}")
        description = meta.get("description")
        require(isinstance(description, str) and 0 < len(description.strip()) <= 1024, f"Invalid description: {source}")
        require("<" not in description and ">" not in description, f"Description contains angle brackets: {source}")
        require(text[match.end():].strip(), f"Empty skill instructions: {source}")
        interface_path = folder / "agents" / "openai.yaml"
        if interface_path.exists():
            config = yaml.safe_load(interface_path.read_text(encoding="utf-8-sig"))
            require(isinstance(config, dict) and isinstance(config.get("interface"), dict), f"Invalid interface: {interface_path}")
            interface = config["interface"]
            prompt = interface.get("default_prompt", "")
            require(isinstance(prompt, str) and f"${name}" in prompt, f"Default prompt must invoke ${name}")
            summary = interface.get("short_description", "")
            require(isinstance(summary, str) and 25 <= len(summary) <= 64, f"Invalid short description: {interface_path}")
        skill_files(folder)

    checked_links = 0
    for base, directories, names in os.walk(ROOT):
        directories[:] = sorted(name for name in directories if name not in SKIP_DIRS and not (Path(base) / name).is_symlink())
        for name in sorted(names):
            if not name.endswith(".md"):
                continue
            source = Path(base) / name
            text = source.read_text(encoding="utf-8-sig")
            text = re.sub(r"(?ms)^```.*?^```[^\n]*$", "", text)
            for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", text):
                target = target.strip().strip("<>")
                url = urlsplit(target)
                if url.scheme or not url.path:
                    continue
                path = (source.parent / unquote(url.path)).resolve()
                require(path.is_relative_to(ROOT), f"Local link leaves repository: {source}: {target}")
                require(path.exists(), f"Broken local link: {source}: {target}")
                checked_links += 1
    print(f"Validated {len(folders)} skill(s) and {checked_links} local links.")
    return folders


def package(folders):
    destination = ROOT / "dist"
    require(not destination.is_symlink(), "dist must not be a symlink.")
    destination.mkdir(exist_ok=True)
    sums = []
    for folder in folders:
        members = {f"{folder.name}/{path.relative_to(folder).as_posix()}": path for path in skill_files(folder)}
        for filename in ("LICENSE", "NOTICE.md"):
            source = ROOT / filename
            require(source.is_file(), f"Missing release notice: {filename}")
            members[f"{folder.name}/{filename}"] = source
        archive = destination / f"{folder.name}.zip"
        require(not archive.is_symlink(), f"Archive must not be a symlink: {archive}")
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as output:
            for name, source in sorted(members.items()):
                data = source.read_text(encoding="utf-8-sig").replace("\r\n", "\n").encode("utf-8")
                info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                info.compress_type = zipfile.ZIP_DEFLATED
                output.writestr(info, data)
        with zipfile.ZipFile(archive) as output:
            require(output.testzip() is None, f"Corrupt archive: {archive}")
            require(set(output.namelist()) == set(members), f"Archive member mismatch: {archive}")
        digest = hashlib.sha256(archive.read_bytes()).hexdigest()
        sums.append(f"{digest}  {archive.name}\n")
        print(f"Built {archive.relative_to(ROOT)} ({len(members)} files)")
    checksum = destination / "SHA256SUMS"
    require(not checksum.is_symlink(), "Checksum file must not be a symlink.")
    checksum.write_text("".join(sums), encoding="utf-8", newline="\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("check", "package"))
    args = parser.parse_args()
    try:
        folders = check()
        if args.command == "package":
            package(folders)
    except (ValueError, OSError, yaml.YAMLError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
