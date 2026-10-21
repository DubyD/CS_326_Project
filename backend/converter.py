import os
import shutil
import subprocess
import tempfile
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IS_WINDOWS = os.name == "nt"

INPUT_C = os.path.join(SCRIPT_DIR, "input.c")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "output.c")


def find_ghidra():
    candidates = [
        os.environ.get("GHIDRA_HOME"),
        os.path.join(SCRIPT_DIR, "tools", "ghidra_11.2_PUBLIC"),
        "/Users/lord/Desktop/Images/ghidra_11.2_PUBLIC",
    ]
    launcher = "analyzeHeadless.bat" if IS_WINDOWS else "analyzeHeadless"
    for c in candidates:
        if c and os.path.isfile(os.path.join(c, "support", launcher)):
            return os.path.join(c, "support", launcher)
    raise FileNotFoundError(
        "Ghidra not found. Run the setup script or set GHIDRA_HOME."
    )


def compile_c(input_file, output_binary):
    try:
        subprocess.run(["gcc", "-o", output_binary, input_file], check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Compilation failed: {e}", file=sys.stderr)
        return False


def decompile_with_ghidra(binary_file, output_file):
    analyze_headless = find_ghidra()
    project_dir = tempfile.mkdtemp(prefix="ghidra_proj_")

    env = os.environ.copy()
    # Stops the Dock icon / focus stealing on macOS
    env["JAVA_TOOL_OPTIONS"] = "-Djava.awt.headless=true -Dapple.awt.UIElement=true"

    try:
        result = subprocess.run(
            [
                analyze_headless,
                project_dir, "TempProject",
                "-import", os.path.abspath(binary_file),
                "-scriptPath", SCRIPT_DIR,
                "-postScript", "decompile_script.py", os.path.abspath(output_file),
                "-deleteProject",
            ],
            env=env,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print("Decompilation failed:", file=sys.stderr)
            print(result.stdout[-2000:], file=sys.stderr)
            print(result.stderr[-2000:], file=sys.stderr)
            return False
        return True
    finally:
        shutil.rmtree(project_dir, ignore_errors=True)


def main():
    # Use paths from Node if given, otherwise fall back to the defaults
    if len(sys.argv) >= 3:
        input_c, output_file = sys.argv[1], sys.argv[2]
    else:
        input_c, output_file = INPUT_C, OUTPUT_FILE

    # Unique per process so concurrent requests don't clobber each other
    binary = os.path.join(
        tempfile.gettempdir(),
        f"converter_{os.getpid()}" + (".exe" if IS_WINDOWS else ""),
    )

    if not compile_c(input_c, binary):
        return 1

    try:
        if not decompile_with_ghidra(binary, output_file):
            return 1
        if not os.path.exists(output_file):
            print("Decompiled file not found.", file=sys.stderr)
            return 1
        return 0
    finally:
        if os.path.exists(binary):
            os.remove(binary)


if __name__ == "__main__":
    sys.exit(main())