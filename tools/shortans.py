#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: shortans.py
@editor: PyCharm
@Date: 2019/2/27 13:33
@Author: ly
@Description: 简答题导入
"""
import uuid
import re
import sqlite3
import docx

con = sqlite3.connect('../data.db')

doc = docx.Document('F:/aa/shortans.docx')

q = ''
ans = ''
q_p = re.compile('^\d+、')
question_bank = []
for paragraph in doc.paragraphs:
    r = re.findall(q_p, paragraph.text.strip())

    # 问题
    if r:
        if q and ans:
            _id = uuid.uuid4().hex
            index = q.index('、')
            question_bank.append([_id, q[index+1:], ans])
            q = ''
            ans = ''
        q = paragraph.text.strip()
    else:
        ans += paragraph.text.strip()
if q and ans:
    _id = uuid.uuid4().hex
    index = q.index('、')
    question_bank.append([_id, q[index+1:], ans])

for n in question_bank:
    try:
        con.execute('''insert into short_answer (id, content, ans) values (?, ?, ?)''', (n[0], n[1], n[2]))
    except Exception as e:
        print(e.args[0])
con.commit()

