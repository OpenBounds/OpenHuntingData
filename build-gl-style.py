#!/usr/bin/env python

import json
import logging
from optparse import OptionParser
import os
import sys

source_key_max_length = 100 #from gaiacloud/gaia/mapsources/models.py

def change_source_url(style, source_id, new_url):
    sources = style["sources"]
    for key, source in sources.iteritems():
        if key == source_id:
            source["tiles"] = [new_url]

    return style


def generate_style(template, source, destination_dir, name=None, center=None):
    with open(template, "rb") as f:
        style_template = json.load(f)

    if name is None:
        name = source
    style_template["id"] = source
    style_template["name"] = name

    if center is not None:
        style_template["center"] = center
        
    server_style = dict(style_template)
    change_source_url(server_style, "data", 
        "https://s3.amazonaws.com/data.openbounds.org/USAHunting/vector/" + \
        source + "/{z}/{x}/{y}.pbf")

    with open(os.path.join(destination_dir, "server.json"), "wb") as f:
        json.dump(server_style, f, sort_keys=True, indent=4, separators=(',', ': '))

    client_style = dict(style_template)
    change_source_url(client_style, "data", "g://%s/{z}/{x}/{y}" % source.replace("/", "_")[:source_key_max_length])

    with open(os.path.join(destination_dir, "client.json"), "wb") as f:
        json.dump(client_style, f, sort_keys=True, indent=4, separators=(',', ': '))


def _main():
    usage = "usage: %prog destination source"
    parser = OptionParser(usage=usage,
                          description="")
    parser.add_option("-d", "--debug", action="store_true", dest="debug",
                      help="Turn on debug logging")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet",
                      help="turn off all logging")

    (options, args) = parser.parse_args()
 
    logging.basicConfig(level=logging.DEBUG if options.debug else
    (logging.ERROR if options.quiet else logging.INFO))

    if len(args) != 2:
        logging.error("Error: wrong number of arguements, see --help")
        sys.exit(-1)

    destination, source = args

    if not os.path.exists(destination):
        logging.error("Destination directory does not exist")
        sys.exit(-1)

    if not os.path.isdir(destination):
        logging.error("destination is not a directory")
        sys.exit(-1)

    source = source.strip("/")
    generate_style("StyleTemplate.json", source, destination)

if __name__ == "__main__":
    _main()
