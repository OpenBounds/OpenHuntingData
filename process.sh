#!/bin/bash
RESULT_DIR=generated

set -ex

echo "Generating geojson"
DOWNLOAD_CACHE=cache python ./Processing/process.py sources/ $RESULT_DIR 2>&1 

VECTOR_MAXZOOM=13
VECTOR_MINZOOM=5

echo "Generating vector tiles"
for i in $RESULT_DIR/*/*/*.geojson; do
    if [[ $i == *.labels.geojson* ]]; then
        echo "skipping " $i
        continue
    fi

    # Final vector output
    VECTOR_MBTILES=`pwd`/`dirname $i`/`basename $i .geojson`.pbf.mbtiles

    #Dont process if output exists
    if [[ -f $VECTOR_MBTILES ]];then
        echo "skipping $i, result MBTiles exist"
        continue
    fi

    echo Processing $i

    WORK_DIR=`mktemp -d`
    echo Using work dir $WORK_DIR
    DATA_MBTILES=$WORK_DIR/data.mbtiles
    python ./Processing/vectorTiling.py --layer regions \
     --max_zoom=$VECTOR_MAXZOOM \
     --min_zoom=$VECTOR_MINZOOM \
     $DATA_MBTILES $i 

    LABELS_GEOJSON=`dirname $i`/`basename $i .geojson`.labels.geojson
    LABELS_MBTILES=$WORK_DIR/labels.mbtiles
    if  [ -e $LABELS_GEOJSON ]; then
        echo "Generating labels mbtiles"
        tippecanoe -o $LABELS_MBTILES $LABELS_GEOJSON \
         -B 8 \
         -b 128 \
         -l regions_labels \
         -Z $VECTOR_MINZOOM \
         -z 10

        echo Merging data and label mbtiles

        COMBINED_MBTILES=$WORK_DIR/combined.mbtiles 
        mortar --output $COMBINED_MBTILES $DATA_MBTILES $LABELS_MBTILES

        mv $COMBINED_MBTILES $VECTOR_MBTILES
    else
        echo "Label geojson not found"
        mv $DATA_MBTILES $VECTOR_MBTILES
    fi

    echo "Uploading vector tiles"
    python ./Processing/upload_mbtiles.py --extension ".pbf" \
     --threads 100 \
     $VECTOR_MBTILES \
     s3://data.openbounds.org/USAHunting/vector/`dirname $i`/`basename $i .geojson`/

    rm -r $WORK_DIR
done

echo "Uploading to s3"
s3cmd sync $RESULT_DIR s3://data.openbounds.org/USAHunting/

STYLE_DIR=styles
if [ -e $STYLE_DIR ]; then
    rm -rf $STYLE_DIR
fi

mkdir $STYLE_DIR
./build-gl-style.py $STYLE_DIR generated/catalog.geojson > $STYLE_DIR/styles.json
s3cmd sync $STYLE_DIR s3://data.openbounds.org/USAHunting/
