import os
import shutil
import subprocess
import tempfile

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
        print("Compilation successful.")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Compilation failed: {e}")
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
            print("Decompilation failed:")
            print(result.stdout)
            print(result.stderr)
            return False
        print("Decompilation successful.")
        return True
    finally:
        shutil.rmtree(project_dir, ignore_errors=True)


def main():
    binary = os.path.join(
        tempfile.gettempdir(), "converter_output" + (".exe" if IS_WINDOWS else "")
    )

    if not compile_c(INPUT_C, binary):
        return

    try:
        if decompile_with_ghidra(binary, OUTPUT_FILE) and os.path.exists(OUTPUT_FILE):
            with open(OUTPUT_FILE, "r") as f:
                print(f"Decompiled code (saved to {OUTPUT_FILE}):\n")
                print(f.read())
        else:
            print("Decompiled file not found.")
    finally:
        if os.path.exists(binary):
            os.remove(binary)


if __name__ == "__main__":
    main()