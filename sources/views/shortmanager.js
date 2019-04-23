/**
 @name: shortmanager.js
 @editor: PyCharm
 @Date: 2019/4/18 13:32
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import {post} from '../models/post';
import * as webix from 'webix';

let shortContent = '';

let getShortCount = function(content) {
  post('/shortans', {content: content, mode: 'get-count'}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('short:pager');
      p.define('count', res.data>0?res.data:res.data+1);
      p.select(0);
    }
  });
};
let getShort = function (content, page) {
  post('/shortans', {mode: 'get-question', page: page, content: content}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('short:tb');
      p.clearAll();
      p.define('data', res.data);
      p.refresh();
    }
  });
};
let addShort = function (content, ans) {
  post('/shortans', {mode: 'add', content: content, ans: ans}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      getShortCount(shortContent);
      webix.alert('添加成功！');
    }
  });
};
let delShort = function (id) {
  post('/shortans', {mode: 'del', id: id}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      getShortCount(shortContent);
      webix.alert('删除成功！');
    }
  });
};
let modifyShort = function (id, content, ans) {
  post('/shortans', {mode: 'modify', id: id, content: content, ans: ans}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      getShortCount(shortContent);
      webix.alert('修改成功！');
    }
  });
};

export default class ShortManager extends JetView {
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
                      width:350,
                      position: 'center', modal: 1,
                      head:{
                        view:"toolbar", margin:-4, cols:[
                          { view:"label", label: "添加简答题" },
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
                            view: 'textarea', label: '题目:', labelPosition: 'top', id: 'short:content', height: 100
                          },
                          {height: 5},
                          {
                            view: 'textarea', label: '答案:', labelPosition: 'top', id: 'short:ans', height: 150
                          },
                          {
                            cols: [
                              {},
                              {
                                view: 'button', label: '确定', width: 100,
                                click: function () {
                                  let content = $$('short:content').getValue();
                                  let ans = $$('short:ans').getValue();
                                  addShort(content, ans);
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
                {
                  view: 'button', label: '批量启用', width: 90,
                  click: function () {
                    let contentId = [];
                    let tb = $$('short:tb');
                    let count = tb.count();
                    for (let i = 0; i < count; i++) {
                      let id = tb.getIdByIndex(i);
                      if (tb.getItem(id).sel === '1') {
                        contentId.push(id);
                      }
                    }
                    post('/shortans', {mode: 'use-question', use: 1, id: contentId}).then(function (r) {
                      let res = r.json();
                      if (res.code !== 0) {
                        webix.alert(res.info);
                      }
                      else {
                        getShortCount(shortContent);
                        webix.alert('启用成功!');
                      }
                    });
                  }
                },
                {
                  view: 'button', label: '批量禁用', width: 90,
                  click: function () {
                    let contentId = [];
                    let tb = $$('short:tb');
                    let count = tb.count();
                    for (let i = 0; i < count; i++) {
                      let id = tb.getIdByIndex(i);
                      if (tb.getItem(id).sel === '1') {
                        contentId.push(id);
                      }
                    }
                    post('/shortans', {mode: 'use-question', use: 0, id: contentId}).then(function (r) {
                      let res = r.json();
                      if (res.code !== 0) {
                        webix.alert(res.info);
                      }
                      else {
                        getShortCount(shortContent);
                        webix.alert('禁用成功!');
                      }
                    });
                  }
                },
                {
                  view: 'button', label: '批量删除', width: 90,
                  click: function () {
                    webix.confirm({text: '是否删除选中试题？', title: '删除确认', ok: '确定', cancel: '取消',
                      callback: function (r) {
                        if (r) {
                          let contentId = [];
                          let tb = $$('short:tb');
                          let count = tb.count();
                          for (let i = 0; i < count; i++) {
                            let id = tb.getIdByIndex(i);
                            if (tb.getItem(id).sel === '1') {
                              contentId.push(id);
                            }
                          }
                          delShort(contentId);
                        }
                      }});
                  }
                },
                {}
              ]
            },
            {
              view: 'search', align: 'center', width: 500, placeholder: '搜索题目...',
              on: {
                onEnter: function () {
                  shortContent = this.getValue();
                  getShortCount(shortContent);
                }
              }
            },
            {}
          ]
        },
        {
          view: 'datatable', scroll: 'y', id: 'short:tb', css: 'table',
          columns: [
            {id: 'sel', header: '', template: '{common.checkbox()}', checkValue: '1', uncheckValue: '0', width: 40},
            {id: 'index', header: '#', adjust: 1},
            {id: 'content', header: '题目', fillspace: 1},
            {
              id: 'use', header: '是否启用', width: 90,
              template: function (obj) {
                return obj.use === 1?'启用':'禁用';
              }
            },
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
                    delShort([id.row]);
                  }
                }});
            }
          },
          on: {
            onItemClick: function (id) {
              if (id.column === 'del' || id.column === 'sel') return;
              let item = this.getItem(id);
              webix.ui({
                view:"window",
                id:"win1", move: 1, width:350,
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
                      view: 'textarea', label: '题目:', labelPosition: 'top', id: 'short:content',
                      value: item.content, height: 100
                    },
                    {height: 5},
                    {
                      view: 'textarea', label: '答案:', labelPosition: 'top', id: 'short:ans',
                      value: item.ans, height: 150
                    },
                    {
                      cols: [
                        {},
                        {
                          view: 'button', label: '确定', width: 100,
                          click: function () {
                            let content = $$('short:content').getValue();
                            let ans = $$('short:ans').getValue();
                            modifyShort(id.row, content, ans);
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
              id: 'short:pager',
              template: '{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}',
              on: {
                onAfterPageChange: function (v) {
                  getShort(shortContent, v);
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
    getShortCount('');
  }
}