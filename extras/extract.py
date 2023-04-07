# Just a little Python script to extract the javascript math functions from a table on a website.

import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with open('./math.txt', 'r') as B:
    str = B.read()
str = str.replace('<td><a href="javascript-math-', 'START1').replace('>', 'START2').replace('<', 'END').split('START1')

A = [C.split('START2')[1].split('END')[0] for C in str]
A.pop(0)
print(A)
