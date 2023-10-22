#!/bin/bash

sudo apt-get update

PLUGIN_USER_DIR="/data/INTERNAL/PeppyMeterPlugin"
METER_TEMPLATE_DIR="${PLUGIN_USER_DIR}/Templates"
PEPPYMETER_RUN_SCRIPT="/data/plugins/user_interface/peppymeter/dist/peppymeter/run_peppymeter.sh"

# Install PeppyMeter Python dependencies
# Credit: 2aCD
# https://github.com/2aCD-creator/volumio-plugins/blob/gh-pages/plugins/miscellanea/peppy_screensaver/install.sh

# Install Python packages
echo "Installing Python packages..."
sudo apt-get -y install python3-pip
sudo apt-get -y install python3-pygame
sudo pip3 install socketIO-client
sudo pip3 install cairosvg

# Install fonts
echo "Installing fonts..."
sudo apt-get install -y \
    fonts-tlwg-laksaman-ttf \
    fonts-noto-cjk \
    fonts-noto-cjk-extra

# Create user directories
echo "Creating user directories (if not exist)..."
mkdir -p "${PLUGIN_USER_DIR}"
chown volumio:volumio "${PLUGIN_USER_DIR}"
chmod 777 "${PLUGIN_USER_DIR}"
mkdir -p "${METER_TEMPLATE_DIR}"
chown volumio:volumio "${METER_TEMPLATE_DIR}"
chmod 777 "${METER_TEMPLATE_DIR}"

# Finalize
chmod +x "${PEPPYMETER_RUN_SCRIPT}"

echo "PeppyMeter plugin installed"
echo "plugininstallend"
