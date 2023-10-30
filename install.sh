#!/bin/bash

sudo apt-get update

PLUGIN_USER_DIR="/data/INTERNAL/PeppyMeterPlugin"
METER_TEMPLATE_DIR="${PLUGIN_USER_DIR}/Templates"
PEPPYMETER_RUN_SCRIPT="/data/plugins/user_interface/peppymeter/dist/peppymeter/run_peppymeter.sh"
PEPPYMETER_REPO="https://github.com/project-owner/PeppyMeter.git"
PEPPYMETER_REPO_COMMIT="c68190ed96aefed6c77d496383c7cd598cb28a9c"

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

# Make PeppyMeter run script executable
chmod +x "${PEPPYMETER_RUN_SCRIPT}"

# Fetch default PeppyMeter templates
echo "Fetching default PeppyMeter templates..."
PEPPYMETER_REPO_TMP_DIR="$(mktemp -d)"
if [ -d "$PEPPYMETER_REPO_TMP_DIR" ]; then
    CURRENT_DIR="$(pwd)"
    cd "$PEPPYMETER_REPO_TMP_DIR"
    echo "Cloning PeppyMeter repo into $PEPPYMETER_REPO_TMP_DIR..."
    git clone $PEPPYMETER_REPO
    if [ -d "PeppyMeter" ]; then
        cd PeppyMeter
        git checkout $PEPPYMETER_REPO_COMMIT
        set -- "large" "medium" "small" "wide"
        for PEPPYMETER_TEMPLATE in "$@"; do
            CP_TEMPLATE_DIR="${METER_TEMPLATE_DIR}/${PEPPYMETER_TEMPLATE}"
            if [ -d "$CP_TEMPLATE_DIR" ]; then
                echo "$CP_TEMPLATE_DIR already exists. Copying skipped."
            elif [ -d "$PEPPYMETER_TEMPLATE" ]; then
                echo "Copying $PEPPYMETER_TEMPLATE..."
                cp -r "$PEPPYMETER_TEMPLATE" "$METER_TEMPLATE_DIR"
                chown volumio:volumio "$CP_TEMPLATE_DIR"
                chmod 777 "$CP_TEMPLATE_DIR"
            else 
                echo "Template directory \"$PEPPYMETER_TEMPLATE\" not found!"
            fi
        done
    else
        echo "PeppyMeter repo directory missing!"
    fi
    cd "$CURRENT_DIR"
    rm -rf "$PEPPYMETER_REPO_TMP_DIR"
else
    echo "Could not create temporary directory for PeppyMeter repo files!"
fi

echo "PeppyMeter plugin installed"
echo "plugininstallend"
