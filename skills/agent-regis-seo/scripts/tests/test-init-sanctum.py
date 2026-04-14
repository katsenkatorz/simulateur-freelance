# /// script
# requires-python = ">=3.10"
# dependencies = ["pytest"]
# ///
"""Tests for init-sanctum.py (agent-regis-seo)"""

import json
import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).parent.parent / "init-sanctum.py"


def setup_skill(tmp_path: Path) -> tuple[Path, Path]:
    """Create minimal skill + project structure for testing."""
    project = tmp_path / "project"
    (project / "_bmad").mkdir(parents=True)

    skill = tmp_path / "skill"
    refs = skill / "references"
    assets = skill / "assets"
    refs.mkdir(parents=True)
    assets.mkdir(parents=True)

    # Capability reference (has code)
    (refs / "seo-audit.md").write_text(
        "---\nname: seo-audit\ncode: AUDIT\ndescription: Full SEO audit\n---\n# Audit\n"
    )
    # Non-capability reference
    (refs / "memory-guidance.md").write_text(
        "---\nname: memory-guidance\ndescription: Memory guidance\n---\n# Memory\n"
    )
    # Capability authoring (evolvable)
    (refs / "capability-authoring.md").write_text(
        "---\nname: capability-authoring\ndescription: How to add capabilities\n---\n# Auth\n"
    )
    # Skill-only file
    (refs / "first-breath.md").write_text("---\nname: first-breath\n---\n# Birth\n")

    # Templates
    for name in ["INDEX", "PERSONA", "CREED", "BOND", "MEMORY", "PULSE"]:
        (assets / f"{name}-template.md").write_text(f"# {name}\nOwner: {{user_name}}\nBorn: {{birth_date}}\n")

    return project, skill


def run_init(project: Path, skill: Path) -> dict:
    result = subprocess.run(
        [sys.executable, str(SCRIPT), str(project), str(skill)],
        capture_output=True, text=True,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    return json.loads(result.stdout)


def test_creates_sanctum(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    assert output["status"] == "created"
    sanctum = Path(output["sanctum"])
    assert sanctum.exists()
    assert (sanctum / "sessions").is_dir()
    assert (sanctum / "capabilities").is_dir()


def test_creates_expected_files(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    sanctum = Path(output["sanctum"])
    for name in ["INDEX.md", "PERSONA.md", "CREED.md", "BOND.md", "MEMORY.md", "PULSE.md", "CAPABILITIES.md"]:
        assert (sanctum / name).exists(), f"Missing {name}"


def test_substitutes_variables(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    sanctum = Path(output["sanctum"])
    index = (sanctum / "INDEX.md").read_text()
    assert "{birth_date}" not in index
    assert "{user_name}" not in index


def test_copies_references_excluding_skill_only(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    sanctum = Path(output["sanctum"])
    refs = sanctum / "references"
    assert (refs / "seo-audit.md").exists()
    assert (refs / "memory-guidance.md").exists()
    assert (refs / "capability-authoring.md").exists()
    assert not (refs / "first-breath.md").exists()


def test_discovers_capabilities(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    assert output["capabilities_discovered"] == 1
    sanctum = Path(output["sanctum"])
    caps = (sanctum / "CAPABILITIES.md").read_text()
    assert "[AUDIT]" in caps
    assert "seo-audit" in caps


def test_evolvable_section_present(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    sanctum = Path(output["sanctum"])
    caps = (sanctum / "CAPABILITIES.md").read_text()
    assert "## Learned" in caps
    assert "How to Add a Capability" in caps


def test_already_exists_skips(tmp_path):
    project, skill = setup_skill(tmp_path)
    run_init(project, skill)

    result = subprocess.run(
        [sys.executable, str(SCRIPT), str(project), str(skill)],
        capture_output=True, text=True,
    )
    output = json.loads(result.stdout)
    assert output["status"] == "already_exists"


def test_reads_config(tmp_path):
    project, skill = setup_skill(tmp_path)
    (project / "_bmad" / "config.yaml").write_text("user_name: Jeff\n")
    output = run_init(project, skill)

    sanctum = Path(output["sanctum"])
    bond = (sanctum / "BOND.md").read_text()
    assert "Jeff" in bond
