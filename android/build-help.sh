#!/bin/bash

# Set sensible script defaults:
# set -e: Terminate script if a command returns an error
set -e
# set -u: Terminate script if an unset variable is used
set -u

## START STANDARD BUILD SCRIPT INCLUDE
# adjust relative paths as necessary
THIS_SCRIPT="$(greadlink -f "${BASH_SOURCE[0]}" 2>/dev/null || readlink -f "${BASH_SOURCE[0]}")"
. "$(dirname "$THIS_SCRIPT")/../resources/build/build-utils.sh"
## END STANDARD BUILD SCRIPT INCLUDE

QUIET=0

. "$KEYMAN_ROOT/resources/shellHelperFunctions.sh"

THIS_DIR="$(dirname "$THIS_SCRIPT")"

display_usage() {
  echo "build.sh [--no-clean] target [...target]"
  echo "Builds help documentation for Keyman for Android"
  echo "Targets:"
  echo "  * htm or html: convert documentation to html using pandoc"
  echo
  echo " --no-clean: don't clean target folder before building"
}

DO_HTM=false
DO_CLEAN=true

# Debug flags
DO_HTM_CONVERSION=true

#
# Parse args
#

shopt -s nocasematch

while [[ $# -gt 0 ]] ; do
  key="$1"
  case $key in
    htm | html)
      DO_HTM=true
      ;;
    --no-clean)
      DO_CLEAN=false
      ;;
    *)
      display_usage
      exit 1
  esac
  shift # past argument
done

if ! $DO_HTM ; then
  display_usage
  exit 1
fi

displayInfo "" \
  "DO_HTM: $DO_HTM" \
  "DO_CLEAN: $DO_CLEAN" \
  ""

#
# Compile all .md to .html
#

cd $KEYMAN_ROOT/android/help

MDLUA="$KEYMAN_ROOT/resources/build/html-link.lua"
CSS="../../resources/build/offline-help-style-spec.txt"
MD=`find . -name "*.md"`
DESTHTM="$THIS_DIR/KMAPro/kMAPro/src/main/assets/info"

if $DO_HTM; then
  #
  # Clean existing folder
  #

  if $DO_CLEAN; then
    rm -rf "$DESTHTM" || true # We don't want to die when we clean an empty folder
  fi
  mkdir -p "$DESTHTM"

  #
  # Generate HTML files from Markdown
  #

  if $DO_HTM_CONVERSION; then
    for INFILE in $MD; do
      OUTFILE="$DESTHTM/${INFILE%.md}.html"
      echo "Processing $INFILE to $(basename "$OUTFILE")"
      mkdir -p "$(dirname "$OUTFILE")"
      pandoc -s -H "$CSS" --lua-filter="$MDLUA" -t html -o "$OUTFILE" $INFILE
    done
  fi

  #
  # Copy Images
  #
  cd $KEYMAN_ROOT/android/help/
  mkdir -p "$DESTHTM/android_images"
  cp android_images/* "$DESTHTM/android_images/"

fi

#
# Copy release notes for Gradle Play Publisher to upload
# Reference: https://github.com/Triple-T/gradle-play-publisher#uploading-release-notes
#
PLAY_RELEASE_NOTES="$KEYMAN_ROOT/android/KMAPro/kMAPro/src/main/play/release-notes/en-US/$TIER.txt"
if [ $TIER = "stable" ]; then
  PLAY_RELEASE_NOTES="$KEYMAN_ROOT/android/KMAPro/kMAPro/src/main/play/release-notes/en-US/default.txt"
fi
echo "Generating Play Store release notes to $PLAY_RELEASE_NOTES"
cp $KEYMAN_ROOT/android/help/about/whatsnew.md $PLAY_RELEASE_NOTES
