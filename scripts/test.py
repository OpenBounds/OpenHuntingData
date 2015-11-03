import json

from jsonschema import validate

schema = json.load(open('source.json'))

validate(json.load(open('wabbit.json')), schema)
