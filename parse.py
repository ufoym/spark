# -*- coding: utf-8 -*-

import json
fn_in = 'in.csv'
fn_json= 'out.json'

select = [12, 3, 5, 4, 6, 8, 9, 2, 11, 15]
cols = []
data = []

with open(fn_in, 'r') as f:
    for i, line in enumerate(f):
        line = line.decode('gbk').encode('utf-8')
        if i == 0:
            terms = line.split(',')
            terms = [terms[s].strip() for s in select if terms[s].strip() != '']
            cols = terms
        else:
            terms = line.split(',')
            terms = [terms[s].strip() for s in select]
            if ''.join(terms) != '':
                entry = {u'操作': '', u'编号': i}
                for col, term in zip(cols, terms):
                    entry[col] = term
                data.append({'id': i, 'values': entry})

with open(fn_json, 'w') as f:
    obj = {
        'metadata': [{
            'name':col,
            'label':col,
            'datatype':'string',
            'editable':True
        } for col in [u'编号'] + cols + [u'操作']],
        'data': data
    }
    obj['metadata'][0]['datatype'] = 'integer'
    obj['metadata'][0]['editable'] = False
    obj['metadata'][-1]['datatype'] = 'html'
    obj['metadata'][-1]['editable'] = False
    obj['metadata'][3]['datatype'] = 'html'
    json.dump(obj, f)