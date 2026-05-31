import sys
sys.path.insert(0, ".")
try:
    import app.models
    import app.main
    print("ALL IMPORTS OK")
    print("Python:", sys.version)
except Exception as e:
    print(f"IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
