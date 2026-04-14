# /// script
# requires-python = ">=3.10"
# dependencies = ["pytest"]
# ///
"""Tests for init-sanctum.py (agent-marc-analytics)"""

import json
import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).parent.parent / "init-sanctum.py"


def setup_skill(tmp_path: Path) -> tuple[Path, Path]:
    project = tmp_path / "project"
    (project / "_bmad").mkdir(parents=True)

    skill = tmp_path / "skill"
    refs = skill / "references"
    assets = skill / "assets"
    refs.mkdir(parents=True)
    assets.mkdir(parents=True)

    (refs / "tracking-audit.md").write_text(
        "---\nname: tracking-audit\ncode: TAUD\ndescription: Tracking audit\n---\n# Audit\n"
    )
    (refs / "funnel-analysis.md").write_text(
        "---\nname: funnel-analysis\ncode: FUNL\ndescription: Funnel analysis\n---\n# Funnel\n"
    )
    (refs / "memory-guidance.md").write_text(
        "---\nname: memory-guidance\ndescription: Memory guidance\n---\n# Memory\n"
    )
    (refs / "first-breath.md").write_text("---\nname: first-breath\n---\n# Birth\n")

    for name in ["INDEX", "PERSONA", "CREED", "BOND", "MEMORY"]:
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
    assert Path(output["sanctum"]).exists()


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


def test_copies_refs_excluding_skill_only(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)
    refs = Path(output["sanctum"]) / "references"
    assert (refs / "tracking-audit.md").exists()
    assert (refs / "funnel-analysis.md").exists()
    assert not (refs / "first-breath.md").exists()


def test_discovers_capabilities(tmp_path):
    project, skill = setup_skill(tmp_path)
    output = run_init(project, skill)
    assert output["capabilities_discovered"] == 2
    caps = (Path(output["sanctum"]) / "CAPABILITIES.md").read_text()
    assert "[TAUD]" in caps
    assert "[FUNL]" in caps


def test_already_exists_skips(tmp_path):
    project, skill = setup_skill(tmp_path)
    run_init(project, skill)
    result = subprocess.run(
        [sys.executable, str(SCRIPT), str(project), str(skill)],
        capture_output=True, text=True,
    )
    assert json.loads(result.stdout)["status"] == "already_exists"


def test_reads_config(tmp_path):
    project, skill = setup_skill(tmp_path)
    (project / "_bmad" / "config.yaml").write_text("user_name: Jeff\n")
    output = run_init(project, skill)
    bond = (Path(output["sanctum"]) / "BOND.md").read_text()
    assert "Jeff" in bond
