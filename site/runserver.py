#!/usr/bin/env python2
import sys
from seetabs import run_seetabs, init_seetabs

host='0.0.0.0'
debug=None

if '-d' in sys.argv or '--debug' in sys.argv:
    debug=True

if '-n' in sys.argv or '--no-debug' in sys.argv:
    debug=False

run_seetabs(debug=debug, host=host)

