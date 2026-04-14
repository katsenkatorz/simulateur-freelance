# /// script
# requires-python = ">=3.10"
# ///
#!/usr/bin/env python3
"""
First Breath — Deterministic sanctum scaffolding for Phillip.

Creates the sanctum folder structure, copies template files with config
values substituted, copies capability files, and auto-generates
CAPABILITIES.md from capability prompt frontmatter.
"""

import argparse
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

# --- Agent-specific configuration ---

SKILL_NAME = "agent-phillip"
SANCTUM_DIR = SKILL_NAME

SKILL_ONLY_FILES = {"first-breath.md"}

TEMPLATE_FILES = [
    "INDEX-template.md",
    "PERSONA-template.md",
    "CREED-template.md",
    "BOND-template.md",
    "MEMORY-template.md",
    "CAPABILITIES-template.md",
]

EVOLVABLE = False

# --- End agent-specific configuration ---


def parse_yaml_config(config_path: Path) -> dict:
    config = {}
    if not config_path.exists():
        return config
    with open(config_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if ":" in line:
                key, _, value = line.partition(":")
                value = value.strip().strip("'\"")
                if value:
                    config[key.strip()] = value
    return config


def parse_frontmatter(file_path: Path) -> dict:
    meta = {}
    with open(file_path) as f:
        content = f.read()
    match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return meta
    for line in match.group(1).strip().split("\n"):
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip().strip("'\"")
    return meta


def copy_references(source_dir: Path, dest_dir: Path) -> list[str]:
    dest_dir.mkdir(parents=True, exist_ok=True)
    copied = []
    for source_file in sorted(source_dir.iterdir()):
        if source_file.name in SKILL_ONLY_FILES:
            continue
        if source_file.is_file():
            shutil.copy2(source_file, dest_dir / source_file.name)
            copied.append(source_file.name)
    return copied


def discover_capabilities(references_dir: Path, sanctum_refs_path: str) -> list[dict]:
    capabilities = []
    for md_file in sorted(references_dir.glob("*.md")):
        if md_file.name in SKILL_ONLY_FILES:
            continue
        meta = parse_frontmatter(md_file)
        if meta.get("name") and meta.get("code"):
            capabilities.append({
                "name": meta["name"],
                "description": meta.get("description", ""),
                "code": meta["code"],
                "source": f"{sanctum_refs_path}/{md_file.name}",
            })
    return capabilities


def generate_capabilities_md(capabilities: list[dict]) -> str:
    lines = [
        "# Capabilities", "", "## Built-in", "",
        "| Code | Name | Description | Source |",
        "|------|------|-------------|--------|",
    ]
    for cap in capabilities:
        lines.append(f"| [{cap['code']}] | {cap['name']} | {cap['description']} | `{cap['source']}` |")
    lines.extend([
        "", "## Tools", "",
        "Prefer crafting your own tools over depending on external ones.",
        "", "### User-Provided Tools", "",
        "_MCP servers, APIs, or services the owner has made available._",
    ])
    return "\n".join(lines) + "\n"


def substitute_vars(content: str, variables: dict) -> str:
    for key, value in variables.items():
        content = content.replace(f"{{{key}}}", value)
    return content


def main():
    parser = argparse.ArgumentParser(
        description="First Breath — Create sanctum scaffolding for agent-phillip"
    )
    parser.add_argument("project_root", help="Project root directory (where _bmad/ lives)")
    parser.add_argument("skill_path", help="Path to the skill directory (where SKILL.md lives)")
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    skill_path = Path(args.skill_path).resolve()

    bmad_dir = project_root / "_bmad"
    memory_dir = bmad_dir / "memory"
    sanctum_path = memory_dir / SANCTUM_DIR
    assets_dir = skill_path / "assets"
    references_dir = skill_path / "references"
    sanctum_refs = sanctum_path / "references"

    result = {
        "agent": SKILL_NAME,
        "sanctum": str(sanctum_path),
        "status": "created",
        "files_created": [],
        "references_copied": 0,
        "capabilities_discovered": 0,
    }

    if sanctum_path.exists():
        result["status"] = "already_exists"
        print(json.dumps(result, indent=2))
        sys.exit(0)

    # Load config
    config = {}
    for config_file in ["config.yaml", "config.user.yaml"]:
        config.update(parse_yaml_config(bmad_dir / config_file))

    today = date.today().isoformat()
    variables = {
        "user_name": config.get("user_name", "friend"),
        "communication_language": config.get("communication_language", "French"),
        "birth_date": today,
        "project_root": str(project_root),
        "sanctum_path": str(sanctum_path),
    }

    # Create structure
    sanctum_path.mkdir(parents=True, exist_ok=True)
    (sanctum_path / "sessions").mkdir(exist_ok=True)

    # Copy references
    copied_refs = copy_references(references_dir, sanctum_refs)
    result["references_copied"] = len(copied_refs)

    # Copy and substitute templates
    for template_name in TEMPLATE_FILES:
        template_path = assets_dir / template_name
        if not template_path.exists():
            continue
        output_name = template_name.replace("-template", "").upper()
        output_name = output_name[:-3] + ".md"
        content = template_path.read_text()
        content = substitute_vars(content, variables)
        (sanctum_path / output_name).write_text(content)
        result["files_created"].append(output_name)

    # Auto-generate CAPABILITIES.md
    capabilities = discover_capabilities(references_dir, "references")
    capabilities_content = generate_capabilities_md(capabilities)
    (sanctum_path / "CAPABILITIES.md").write_text(capabilities_content)
    result["files_created"].append("CAPABILITIES.md")
    result["capabilities_discovered"] = len(capabilities)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
