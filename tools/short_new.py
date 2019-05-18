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

wb = xlrd.open_workbook('F:/aa/short201902.xls')
short_sheet = wb.sheet_by_index(0)
total_rows = short_sheet.nrows
scu_num = 0

for n in range(1, total_rows):
    row = short_sheet.row(n)
    content = row[1].value.strip()
    ans = row[2].value.strip()
    _id = uuid.uuid4().hex
    try:
        con.execute('''insert into short_answer (id, content, ans) values (?, ?, ?)''',
                    (_id, content, ans))
        scu_num += 1
    except Exception as e:
        print(e.args[0])
con.commit()
print('成功导入{}道试题'.format(scu_num))
