/**
 @name: judgemanager.js
 @editor: PyCharm
 @Date: 2019/4/18 9:48
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import {post} from '../models/post';
import * as webix from 'webix';

let judgeContent = '';

let getJudgeCount = function(content) {
  post('/judge', {content: content, mode: 'get-count'}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('judge:pager');
      p.define('count', res.data>0?res.data:res.data+1);
      p.select(0);
    }
  });
};
let getJudge = function (content, page) {
  post('/judge', {mode: 'get-question', page: page, content: content}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('judge:tb');
      p.clearAll();
      p.define('data', res.data);
      p.refresh();
    }
  });
};
let addJudge = function (content, ans) {
  post('/judge', {mode: 'add', content: content, ans: ans}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      webix.alert('添加成功！');
    }
  });
};
let delJudge = function (id) {
  post('/judge', {mode: 'del', id: id}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      webix.alert('删除成功！');
    }
  });
};
let modifyJudge = function (id, content, ans) {
  post('/judge', {mode: 'modify', id: id, content: content, ans: ans}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      webix.alert('修改成功！');
    }
  });
};

export default class JudgeManager extends JetView {
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
                      height:250, width:350,
                      position: 'center', modal: 1,
                      head:{
                        view:"toolbar", margin:-4, cols:[
                          { view:"label", label: "添加判断题" },
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
                            view: 'textarea', label: '题目:', labelPosition: 'top', id: 'judge:content'
                          },
                          {height: 5},
                          {
                            view: 'radio', label: '答案:', options: [
                              {id: '0', value: '错'},
                              {id: '1', value: '对'},
                            ], value: '0', align: 'center', id: 'judge:ans'
                          },
                          {
                            cols: [
                              {},
                              {
                                view: 'button', label: '确定', width: 100,
                                click: function () {
                                  let content = $$('judge:content').getValue();
                                  let ans = $$('judge:ans').getValue();
                                  addJudge(content, ans);
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
                  judgeContent = this.getValue();
                  getJudgeCount(judgeContent);
                }
              }
            },
            {}
          ]
        },
        {
          view: 'datatable', scroll: 'y', id: 'judge:tb', css: 'table',
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
                    delJudge(id.row);
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
                height:250, width:350,
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
                      view: 'textarea', label: '题目:', labelPosition: 'top', id: 'judge:content', value: item.content
                    },
                    {height: 5},
                    {
                      view: 'radio', label: '答案:', options: [
                        {id: '0', value: '错'},
                        {id: '1', value: '对'},
                      ], value: item.ans, align: 'center', id: 'judge:ans'
                    },
                    {
                      cols: [
                        {},
                        {
                          view: 'button', label: '确定', width: 100,
                          click: function () {
                            let content = $$('judge:content').getValue();
                            let ans = $$('judge:ans').getValue();
                            modifyJudge(id.row, content, ans);
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
              id: 'judge:pager',
              template: '{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}',
              on: {
                onAfterPageChange: function (v) {
                  getJudge(judgeContent, v);
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
    getJudgeCount('');
  }
}