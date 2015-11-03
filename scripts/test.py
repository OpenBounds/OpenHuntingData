import json

from jsonschema import validate

wabbit = json.load(open('wabbit.json'))
schema = json.load(open('../schemas/source.json'))

validate(wabbit, schema)
