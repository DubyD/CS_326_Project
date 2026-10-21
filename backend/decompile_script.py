# Runs inside Ghidra (Jython 2.7)
import re
from ghidra.app.decompiler import DecompInterface, DecompileOptions
from ghidra.util.task import ConsoleTaskMonitor

out_path = getScriptArgs()[0]

opts = DecompileOptions()
opts.grabFromProgram(currentProgram)
try:
    opts.setEliminateUnreachable(False)
except Exception:
    pass

ifc = DecompInterface()
ifc.setOptions(opts)
ifc.openProgram(currentProgram)
monitor = ConsoleTaskMonitor()

# Ghidra type -> standard C type
TYPE_MAP = [
    (r'\bundefined8\b', 'long long'),
    (r'\bundefined4\b', 'int'),
    (r'\bundefined2\b', 'short'),
    (r'\bundefined1\b', 'char'),
    (r'\bundefined\b',  'char'),
    (r'\bbyte\b',       'unsigned char'),
    (r'\buint\b',       'unsigned int'),
    (r'\bulong\b',      'unsigned long'),
    (r'\bbool\b',       'int'),
]

def clean(code):
    # drop warning comments
    lines = [l for l in code.splitlines() if not l.strip().startswith("/* WARNING")]
    code = "\n".join(lines)
    # entry -> main (Mach-O) and strip leading underscores on libc calls
    code = re.sub(r'\bentry\b', 'main', code)
    code = re.sub(r'\b_(printf|puts|scanf|malloc|free|strlen|strcpy|memcpy|exit)\b', r'\1', code)
    for pattern, repl in TYPE_MAP:
        code = re.sub(pattern, repl, code)
    return code.strip()

functions = []
for func in currentProgram.getFunctionManager().getFunctions(True):
    if func.isExternal() or func.isThunk():
        continue
    res = ifc.decompileFunction(func, 60, monitor)
    if res.decompileCompleted():
        functions.append(clean(res.getDecompiledFunction().getC()))

header = "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n"

with open(out_path, 'w') as f:
    f.write(header)
    f.write("\n\n".join(functions) + "\n")