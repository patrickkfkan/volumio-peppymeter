#!/bin/bash

# Starts PeppyMeter
# Credit: 2aCD
# https://github.com/2aCD-creator/volumio-plugins/blob/gh-pages/plugins/miscellanea/peppy_screensaver/volumio_peppymeter/run_peppymeter.sh

cd /data/plugins/user_interface/peppymeter/dist/peppymeter

# Commented out the if block since there could be other 'python3' scripts running
#if ! pgrep -x "python3" > /dev/null
#then
	PYTHONUNBUFFERED=1 DISPLAY=:0 python3 volumio_peppymeter.py
#fi
