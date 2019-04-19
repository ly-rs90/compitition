/**
 @name: usermanager.js
 @editor: PyCharm
 @Date: 2019/4/19 15:27
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import * as webix from 'webix';
import {post} from '../models/post';

let userContent = '';

let getUserCount = function(content) {
  post('/user', {content: content, mode: 'get-count'}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('user:pager');
      p.define('count', res.data>0?res.data:res.data+1);
      p.select(0);
    }
  });
};

let getUser = function (content, page) {
  post('/user', {mode: 'get-user', page: page, content: content}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let p = $$('user:tb');
      p.clearAll();
      p.define('data', res.data);
      p.refresh();
    }
  });
};

let delUser = function (id) {
  post('/user', {mode: 'del', id: id}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      getUserCount(userContent);
      webix.alert('删除成功！');
    }
  });
};

let modifyUser = function (id, psw) {
  post('/user', {mode: 'modify', id: id, password: psw}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      webix.alert('修改成功！');
    }
  });
};

export default class UserManager extends JetView {
  config() {
    return {
      rows: [
        {height: 20},
        {
          cols: [
            {},
            {
              view: 'search', align: 'center', width: 500, placeholder: '搜索用户...',
              on: {
                onEnter: function () {
                  userContent = this.getValue();
                  getUserCount(userContent);
                }
              }
            },
            {}
          ]
        },
        {
          view: 'datatable', id: 'user:tb', scroll: 'y',
          columns: [
            {id: 'index', header: '#', adjust: 1},
            {id: 'id', header: '用户名', fillspace: 1},
            {id: 'name', header: '姓名', fillspace: 1},
            {id: 'password', header: '密码', fillspace: 1, template: '******'},
            {id: 'role', header: '角色', fillspace: 1, template: function (obj) {
                return obj.role === 0?'管理员':'普通用户';
              }},
            {id: 'del', header: '', template: '<span class="fas fa-trash-alt"></span>', width: 50}
          ],
          scheme: {
            $init: function (obj) {
              obj.index = this.count();
            }
          },
          onClick: {
            'fa-trash-alt': function (e, id) {
              webix.confirm({text: '是否删除该用户？', title: '删除确认', ok: '确定', cancel: '取消',
                callback: function (r) {
                  if (r) {
                    delUser(id.row);
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
                    { view:"label", label: "修改用户密码" },
                    { view:"icon", icon:"fas fa-times", click:function(){
                        $$('win1').close();
                      }}
                  ]
                },
                body: {
                  paddingX: 10,
                  rows: [
                    {height: 5},
                    {view: 'text', label: '用户名', id: 'user:id', value: item.id, readonly: 1},
                    {view: 'text', label: '姓名', id: 'user:name', value: item.name, readonly: 1},
                    {view: 'text', label: '密码', id: 'user:psw', placeholder: '请输入新密码...', type: 'password', required: 1},
                    {view: 'text', label: '重复密码', id: 'user:npsw', placeholder: '请重复输入新密码...', type: 'password', required: 1},
                    {view: 'text', label: '角色', id: 'user:role', value: item.role === 0?'管理员':'普通用户', readonly: 1},
                    {height: 5},
                    {
                      cols: [
                        {},
                        {
                          view: 'button', label: '确定', width: 100,
                          click: function () {
                            let psw = $$('user:psw').getValue();
                            let npsw = $$('user:npsw').getValue();
                            if (psw === '') {
                              webix.alert('密码不能为空！');
                            }
                            else if (psw !== npsw) {
                              webix.alert('两次密码输入不一致！');
                            }
                            else {
                              modifyUser(id.row, psw);
                            }
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
              id: 'user:pager',
              template: '{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}',
              on: {
                onAfterPageChange: function (v) {
                  getUser(userContent, v);
                }
              }
            },
            {}
          ]
        }
      ]
    };
  }
  ready(_$view, _$url) {
    $$('admin:menu').select('usermanager');
    getUserCount('');
  }
}