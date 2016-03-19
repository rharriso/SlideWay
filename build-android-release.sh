#! /bin/sh
#
# build-android-release.sh
# Copyright (C) 2016 rharriso <rharriso@lappy>
#
# Distributed under terms of the MIT license.
#

rm -f Planar.apk

# create jar
cordova build --release android && 

# sign jar
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk Planar &&

# zip it up
/opt/android-sdk-linux-downloaded/build-tools/19.1.0/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk Planar.apk
