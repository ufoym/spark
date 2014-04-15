import json
fn_in = 'in.csv'
fn_json= 'out.json'

cols = []
data = []
with open(fn_in, 'r') as f:
    for i, line in enumerate(f):
        line = line.decode('gbk').encode('utf-8')
        if i == 0:
            for t in line.split(','):
                t = t.strip()
                if t != '':
                    cols.append(t)
        else:
            terms = [t.strip() for t in line.split(',')[:len(cols)]]
            if ''.join(terms) != '':
                entry = {'action': ''}
                for col, term in zip(cols, terms):
                    entry[col] = term
                data.append({'id': i, 'values': entry})

with open(fn_json, 'w') as f:
    json.dump({
        'metadata': [{
            'name':col,
            'label':col,
            'datatype':'string',
            'editable':True
        } for col in cols + ['action']],
        'data': data
    }, f)