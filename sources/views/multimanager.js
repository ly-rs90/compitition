/**
 @name: multimanager.js
 @editor: PyCharm
 @Date: 2019/4/18 12:47
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import {post} from '../models/post';
import * as webix from 'webix';

let multiContent = '';

let getMultiCount = function(content) {
  post('/multichoice', {content: content, mode: 'get-count'}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('multi:pager');
      p.define('count', res.data>0?res.data:res.data+1);
      p.select(0);
    }
  });
};
let getMulti = function (content, page) {
  post('/multichoice', {mode: 'get-question', page: page, content: content}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('multi:tb');
      p.clearAll();
      p.define('data', res.data);
      p.refresh();
    }
  });
};
let addMulti = function (content, c1, c2, c3, c4, ans) {
  post('/multichoice', {mode: 'add', content: content, ans: ans, c1: c1, c2: c2, c3: c3, c4: c4}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      webix.alert('添加成功！');
    }
  });
};
let delMulti = function (id) {
  post('/multichoice', {mode: 'del', id: id}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      webix.alert('删除成功！');
    }
  });
};
let modifyMulti = function (id, content, c1, c2, c3, c4, ans) {
  post('/multichoice', {mode: 'modify', id: id, content: content, ans: ans, c1: c1, c2: c2, c3: c3, c4: c4}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      webix.alert('修改成功！');
    }
  });
};

export default class MultiManager extends JetView {
  config() {
    return {
      rows: [
        {
          cols: [
            {
              cols: [
                {
                  view: 'button', label: '添加', width: 100,
                  click: function () {
                    webix.ui({
                      view:"window",
                      id:"win1", move: 1,
                      width: 350,
                      position: 'center', modal: 1,
                      head:{
                        view:"toolbar", margin:-4, cols:[
                          { view:"label", label: "添加多选题" },
                          { view:"icon", icon:"fas fa-times", click:function(){
                              $$('win1').close();
                            }}
                        ]
                      },
                      body: {
                        paddingX: 10,
                        rows: [
                          {height: 5},
                          {
                            view: 'textarea', label: '题目:', labelPosition: 'top', id: 'multi:content', height: 120
                          },
                          {height: 5},
                          {view: 'text', label: '选项A', id: 'ans:a', labelWidth: 70},
                          {view: 'text', label: '选项B', id: 'ans:b', labelWidth: 70},
                          {view: 'text', label: '选项C', id: 'ans:c', labelWidth: 70},
                          {view: 'text', label: '选项D', id: 'ans:d', labelWidth: 70},
                          {
                            cols: [
                              {view: 'label', label: '答案:'},
                              {
                                view: 'checkbox', checkValue: '1', uncheckValue: '', labelRight: 'A', label: '',
                                id: 'ans1', labelWidth: 0
                              },
                              {
                                view: 'checkbox', checkValue: '2', uncheckValue: '', labelRight: 'B', label: '',
                                id: 'ans2', labelWidth: 0
                              },
                              {
                                view: 'checkbox', checkValue: '3', uncheckValue: '', labelRight: 'C', label: '',
                                id: 'ans3', labelWidth: 0
                              },
                              {
                                view: 'checkbox', checkValue: '4', uncheckValue: '', labelRight: 'D', label: '',
                                id: 'ans4', labelWidth: 0
                              }
                            ]
                          },
                          {
                            cols: [
                              {},
                              {
                                view: 'button', label: '确定', width: 100,
                                click: function () {
                                  let content = $$('multi:content').getValue();
                                  let c1 = $$('ans:a').getValue();
                                  let c2 = $$('ans:b').getValue();
                                  let c3 = $$('ans:c').getValue();
                                  let c4 = $$('ans:d').getValue();
                                  let ans = $$('ans1').getValue() + $$('ans2').getValue() +
                                    $$('ans3').getValue() + $$('ans4').getValue();
                                  addMulti(content, c1, c2, c3, c4, ans);
                                  $$('win1').close();
                                }
                              },
                              {}
                            ]
                          },
                          {height: 10}
                        ]
                      }
                    }).show();
                  }
                },
                {}
              ]
            },
            {
              view: 'search', align: 'center', width: 500, placeholder: '搜索题目...',
              on: {
                onEnter: function () {
                  multiContent = this.getValue();
                  getMultiCount(multiContent);
                }
              }
            },
            {}
          ]
        },
        {
          view: 'datatable', scroll: 'y', id: 'multi:tb', css: 'table',
          columns: [
            {id: 'index', header: '#', adjust: 1},
            {id: 'content', header: '题目', fillspace: 1},
            {id: 'del', header: '', template: '<span class="fas fa-trash-alt"></span>', width: 50}
          ],
          scheme:{
            $init:function(obj){ obj.index = this.count(); }
          },
          onClick: {
            'fa-trash-alt': function (e, id) {
              webix.confirm({text: '是否删除该题？', title: '删除确认', ok: '确定', cancel: '取消',
                callback: function (r) {
                  if (r) {
                    delMulti(id.row);
                  }
                }});
            }
          },
          on: {
            onItemClick: function (id) {
              if (id.column === 'del') return;
              let item = this.getItem(id);
              webix.ui({
                view:"window",
                id:"win1", move: 1,
                width:350,
                position: 'center', modal: 1,
                head:{
                  view:"toolbar", margin:-4, cols:[
                    { view:"label", label: "编辑题目" },
                    { view:"icon", icon:"fas fa-times", click:function(){
                        $$('win1').close();
                      }}
                  ]
                },
                body: {
                  paddingX: 10,
                  rows: [
                    {height: 5},
                    {
                      view: 'textarea', label: '题目:', labelPosition: 'top', id: 'multi:content', value: item.content,
                      height: 120
                    },
                    {height: 5},
                    {view: 'text', label: '选项A', id: 'ans:a', labelWidth: 70, value: item.c1},
                    {view: 'text', label: '选项B', id: 'ans:b', labelWidth: 70, value: item.c2},
                    {view: 'text', label: '选项C', id: 'ans:c', labelWidth: 70, value: item.c3},
                    {view: 'text', label: '选项D', id: 'ans:d', labelWidth: 70, value: item.c4},
                    {
                      cols: [
                        {view: 'label', label: '答案:'},
                        {
                          view: 'checkbox', checkValue: '1', uncheckValue: '', labelRight: 'A', label: '',
                          id: 'ans1', labelWidth: 0, value: item.ans.indexOf('1') === -1?'':'1'
                        },
                        {
                          view: 'checkbox', checkValue: '2', uncheckValue: '', labelRight: 'B', label: '',
                          id: 'ans2', labelWidth: 0, value: item.ans.indexOf('2') === -1?'':'2'
                        },
                        {
                          view: 'checkbox', checkValue: '3', uncheckValue: '', labelRight: 'C', label: '',
                          id: 'ans3', labelWidth: 0, value: item.ans.indexOf('3') === -1?'':'3'
                        },
                        {
                          view: 'checkbox', checkValue: '4', uncheckValue: '', labelRight: 'D', label: '',
                          id: 'ans4', labelWidth: 0, value: item.ans.indexOf('4') === -1?'':'4'
                        }
                      ]
                    },
                    {
                      cols: [
                        {},
                        {
                          view: 'button', label: '确定', width: 100,
                          click: function () {
                            let content = $$('multi:content').getValue();
                            let c1 = $$('ans:a').getValue();
                            let c2 = $$('ans:b').getValue();
                            let c3 = $$('ans:c').getValue();
                            let c4 = $$('ans:d').getValue();
                            let ans = $$('ans1').getValue() + $$('ans2').getValue() +
                            $$('ans3').getValue() + $$('ans4').getValue();
                            modifyMulti(id.row, content, c1, c2, c3, c4, ans);
                            $$('win1').close();
                          }
                        },
                        {}
                      ]
                    },
                    {height: 10}
                  ]
                }
              }).show();
            }
          }
        },
        {
          cols: [
            {},
            {
              view: 'pager', master: false, size: 30, group: 5, count: 1, align: 'center', css: 'pager',
              id: 'multi:pager',
              template: '{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}',
              on: {
                onAfterPageChange: function (v) {
                  getMulti(multiContent, v);
                }
              }
            },
            {}
          ]
        }
      ]
    };
  }
  init(_$view, _$) {
    getMultiCount('');
  }
}