import os
import shutil
import subprocess
import sys
import tempfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOOLS_DIR = os.path.join(SCRIPT_DIR, "tools")
IS_WINDOWS = os.name == "nt"

GHIDRA_DIR = os.path.join(TOOLS_DIR, "ghidra_11.2_PUBLIC")
JDK_DIR = os.path.join(TOOLS_DIR, "jdk")

EXIT_DECOMPILE_FAILED = 1
EXIT_COMPILE_FAILED = 2
EXIT_NOT_INSTALLED = 3
EXIT_USAGE = 64

SETUP_HINT = (
    "Run backend/setup_mac_linux.sh (macOS/Linux) or "
    "backend\\setup_windows.bat (Windows) from the project root."
)


class NotInstalledError(Exception):
    pass


def find_ghidra():
    launcher = "analyzeHeadless.bat" if IS_WINDOWS else "analyzeHeadless"
    path = os.path.join(GHIDRA_DIR, "support", launcher)
    if not os.path.isfile(path):
        raise NotInstalledError(f"Ghidra not found at {GHIDRA_DIR}. {SETUP_HINT}")
    return path


def find_java_home():
    java = "java.exe" if IS_WINDOWS else "java"
    # macOS JDK archives keep the real home under Contents/Home
    for home in (os.path.join(JDK_DIR, "Contents", "Home"), JDK_DIR):
        if os.path.isfile(os.path.join(home, "bin", java)):
            return home
    raise NotInstalledError(f"JDK not found at {JDK_DIR}. {SETUP_HINT}")


def compile_c(input_file, output_binary):
    try:
        result = subprocess.run(
            ["gcc", "-o", output_binary, input_file],
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        raise NotInstalledError(f"gcc not found on PATH. {SETUP_HINT}")
    if result.returncode != 0:
        # gcc's message is what the user needs to fix their code
        print("Compilation failed:\n" + result.stderr.strip(), file=sys.stderr)
        return False
    return True


def decompile_with_ghidra(binary_file, output_file):
    analyze_headless = find_ghidra()
    java_home = find_java_home()
    project_dir = tempfile.mkdtemp(prefix="ghidra_proj_")

    env = os.environ.copy()
    # Make Ghidra use the JDK in backend/tools instead of any system Java
    env["JAVA_HOME"] = java_home
    env["PATH"] = os.path.join(java_home, "bin") + os.pathsep + env.get("PATH", "")
    # Headless mode; also stops the Dock icon / focus stealing on macOS
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


def main(argv):
    if len(argv) != 3:
        print("Usage: python3 converter.py <input.c> <output.c>", file=sys.stderr)
        return EXIT_USAGE

    input_c, output_file = argv[1], argv[2]
    if not os.path.isfile(input_c):
        print(f"Input file not found: {input_c}", file=sys.stderr)
        return EXIT_USAGE

    # Unique per process so concurrent requests don't clobber each other
    binary = os.path.join(
        tempfile.gettempdir(),
        f"converter_{os.getpid()}" + (".exe" if IS_WINDOWS else ""),
    )

    try:
        # Check the tools before compiling so a missing install is reported clearly
        find_ghidra()
        find_java_home()
        if not compile_c(input_c, binary):
            return EXIT_COMPILE_FAILED
        if not decompile_with_ghidra(binary, output_file):
            return EXIT_DECOMPILE_FAILED
        if not os.path.exists(output_file):
            print("Decompiled file not found.", file=sys.stderr)
            return EXIT_DECOMPILE_FAILED
        return 0
    except NotInstalledError as e:
        print(str(e), file=sys.stderr)
        return EXIT_NOT_INSTALLED
    finally:
        if os.path.exists(binary):
            os.remove(binary)


if __name__ == "__main__":
    sys.exit(main(sys.argv))