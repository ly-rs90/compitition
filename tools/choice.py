#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: choice.py
@editor: PyCharm
@Date: 2019/2/27 12:54
@Author: ly
@Description: 
"""
import uuid
import sqlite3
import xlrd

con = sqlite3.connect('../data.db')

wb = xlrd.open_workbook('F:/aa/a.xls')
judge_sheet = wb.sheet_by_index(0)
total_rows = judge_sheet.nrows

for n in range(1, total_rows):
    row = judge_sheet.row(n)
    content = row[1].value.strip()
    c1 = str(row[2].value).strip()
    c2 = str(row[3].value).strip()
    c3 = str(row[4].value).strip()
    c4 = str(row[5].value).strip()
    ans = str(int(row[6].value)).strip()
    _id = uuid.uuid4().hex
    try:
        con.execute('''insert into choice (id, content, c1, c2, c3, c4, ans) values (?, ?, ?, ?, ?, ?, ?)''',
                    (_id, content, c1, c2, c3, c4, ans))
    except Exception as e:
        print(e.args[0])
con.commit()
