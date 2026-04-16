# /// script
# requires-python = ">=3.10"
# dependencies = ["pytest"]
# ///
"""Tests for init-sanctum.py"""

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

    # Create a capability reference
    (refs / "business-review.md").write_text(
        "---\nname: business-review\ncode: BIZ\ndescription: Business analysis\n---\n# BIZ\n"
    )
    # Create a non-capability reference (no code)
    (refs / "memory-guidance.md").write_text(
        "---\nname: memory-guidance\ndescription: Memory guidance\n---\n# Memory\n"
    )
    # Create a skill-only file that should NOT be copied
    (refs / "first-breath.md").write_text("---\nname: first-breath\n---\n# Birth\n")

    # Create a template
    (assets / "INDEX-template.md").write_text("# Index\nBorn: {birth_date}\nOwner: {user_name}\n")
    (assets / "PERSONA-template.md").write_text("# Persona\nBorn: {birth_date}\n")
    (assets / "CREED-template.md").write_text("# Creed\n")
    (assets / "BOND-template.md").write_text("# Bond\nName: {user_name}\n")
    (assets / "MEMORY-template.md").write_text("# Memory\n")
    (assets / "CAPABILITIES-template.md").write_text("# Capabilities\n")

    return project, skill


def run_init(project: Path, skill: Path) -> dict:
    """Run init-sanctum.py and return parsed JSON output."""
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


def test_creates_expected_files(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    sanctum = Path(output["sanctum"])
    for name in ["INDEX.md", "PERSONA.md", "CREED.md", "BOND.md", "MEMORY.md", "CAPABILITIES.md"]:
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
    assert (refs / "business-review.md").exists()
    assert (refs / "memory-guidance.md").exists()
    assert not (refs / "first-breath.md").exists(), "first-breath.md should not be copied"


def test_discovers_capabilities(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)

    assert output["capabilities_discovered"] == 1
    sanctum = Path(output["sanctum"])
    caps = (sanctum / "CAPABILITIES.md").read_text()
    assert "[BIZ]" in caps
    assert "business-review" in caps


def test_already_exists_skips(tmp_path):
    project, skill = setup_skill(tmp_path)
    run_init(project, skill)

    # Second run should detect existing sanctum
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
