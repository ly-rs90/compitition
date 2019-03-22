#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: multichoice.py
@editor: PyCharm
@Date: 2019/2/27 13:13
@Author: ly
@Description: 多项选择导入
"""
import re
import uuid
import sqlite3
import xlrd

con = sqlite3.connect('../data.db')

wb = xlrd.open_workbook('F:/aa/a.xls')
judge_sheet = wb.sheet_by_index(1)
total_rows = judge_sheet.nrows

for n in range(1, total_rows):
    row = judge_sheet.row(n)
    content = row[1].value.strip()
    c1 = str(row[2].value).strip()
    c2 = str(row[3].value).strip()
    c3 = str(row[4].value).strip()
    c4 = str(row[5].value).strip()
    ans = str(row[6].value).strip()
    ans_p = re.compile('\d')
    ans = ''.join(re.findall(ans_p, ans))
    _id = uuid.uuid4().hex
    try:
        con.execute('''insert into multi_choice (id, content, c1, c2, c3, c4, ans) values (?, ?, ?, ?, ?, ?, ?)''',
                    (_id, content, c1, c2, c3, c4, ans))
    except Exception as e:
        print(e.args[0])
con.commit()