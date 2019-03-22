#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: judge.py
@editor: PyCharm
@Date: 2019/2/27 10:48
@Author: ly
@Description: 选择题导入
"""
import uuid
import sqlite3
# from openpyxl import load_workbook
import xlrd

con = sqlite3.connect('../data.db')

wb = xlrd.open_workbook('F:/aa/a.xls')
judge_sheet = wb.sheet_by_index(2)
total_rows = judge_sheet.nrows

for n in range(1, total_rows):
    row = judge_sheet.row(n)
    content = row[1].value.strip()
    ans = 0 if row[2].value.strip() == '错' else 1
    _id = uuid.uuid4().hex
    try:
        con.execute('''insert into judge (id, content, ans) values (?, ?, ?)''', (_id, content, ans))
    except Exception as e:
        print(e.args[0])
con.commit()

