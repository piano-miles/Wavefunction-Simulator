# Just a little Python script to extract the javascript math functions from a table on a website.

import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

B = open('./math.txt', 'r')
str = B.read()
B.close()

str = str.replace('<td><a href="javascript-math-', 'START1').replace('>', 'START2').replace('<', 'END').split('START1')

A = []
for C in str:
    A.append(C.split('START2')[1].split('END')[0])

A.pop(0)
print(A)
