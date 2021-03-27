# its machine learning guys, dw
import pandas as pd
from sys import stdin
correct = 0
wrong = 0
data = list(pd.read_csv('training.csv')['LogReturns'])
for idx, x in enumerate(data):
    grad = 0
    if idx not in (0, len(data)-1):
        grad = data[idx] - data[idx-1]
        is_next_up = (data[idx+1] - data[idx]) > 0
        next_up_pred = grad > 0
        if is_next_up == next_up_pred:
            correct += 1
        else:
            wrong += 1
coeff = 0
if (correct > wrong):
    coeff = 1
else:
    coeff = -1

# classify terminal input
idx = 0
last_val = 0
for line in stdin:
    grad = 0
    input_vals = line.split(',')
    grad = float(input_vals[-1]) - float(input_vals[-2])
    if (coeff*grad > 0):
        print(1)
    else:
        print(0)
