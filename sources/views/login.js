/**
 @name: login.js
 @editor: PyCharm
 @Date: 2019/2/26 15:36
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
import {JetView} from "webix-jet";
import {post} from "../models/post";

export default class Login extends JetView {
  config() {
    return {
      css: 'login',
      cols: [
        {
          gravity: 5,
          rows: [
            {},
            {
              height: 280, css: 'login-bar',
              rows: [
                {},
                {
                  height: 60,
                  view: 'label', label: '华东竞赛系统', align: 'center', css: 'login-big-title'
                },
                {
                  height: 40,
                  view: 'label', label: 'Hua Dong Competition System', align: 'center',
                  css: 'login-small-title'
                },
                {}
              ]
            },
            {}
          ]
        },
        {
          width: 340,
          rows: [
            {},
            {
              height: 360, css: 'login-form',
              view: 'form', id: 'login:form',
              elements: [
                {},
                {view: 'label', label: '用户登录', align: 'center', css: 'login-form-title'},
                {},
                {view: 'text', name: 'user', label: '用户', labelWidth: 50, required: 1},
                {height: 5},
                {view: 'text', name: 'password', label: '密码', labelWidth: 50, type: 'password', required: 1},
                {view: 'label', hidden: 1, id: 'error', css: 'error-msg'},
                {
                  view: 'button', value: '登录', type: 'form', click: function () {
                    let _this = this;
                    let form = $$('login:form');
                    if (form.validate()) {
                      post('/login', form.getValues()).then(function (r) {
                        let res = r.json();
                        if (res.code === 0) {
                          webix.storage.cookie.put('name', res.data);
                          _this.$scope.show('/compitition/admin/paperpublish');
                          $$('hello:user').define('label', `您好，${res.data}！`);
                          $$('hello:user').refresh();
                          $$('hello:user').show();
                        }
                        else if (res.code === 1) {
                          webix.storage.cookie.put('name', res.data);
                          _this.$scope.show('/compitition/mode');
                          $$('hello:user').define('label', `您好，${res.data}！`);
                          $$('hello:user').refresh();
                          $$('hello:user').show();
                        }
                        else {
                          $$('error').define('label', res.info);
                          $$('error').refresh();
                          $$('error').show();
                        }
                      });
                    }
                  }
                },
                {
                  cols: [
                    {},
                    {
                      view: 'label', label: '用户注册', width: 70,
                      css: 'login-form-register', align: 'center',
                      click: function () {
                        webix.ui({
                          view:"window",
                          id:"register",
                          height:250,
                          width:350,
                          move: 1, modal: 1, position: 'center',
                          head:{
                            view:"toolbar", cols:[
                              {view:"label", label: "新用户注册" },
                              {
                                view:"icon", icon: 'fas fa-times', autowidth: 1, align: 'right',
                                click:function(){ $$('register').close(); }
                              }
                            ]
                          },
                          body:{
                            rows: [
                              {
                                view: 'form', borderless: 1, id: 'register:form',
                                elements: [
                                  {
                                    view: 'text', label: '员工号', required: 1, name: 'id',
                                    validate: function (v) {
                                      let p = /^\w+$/;
                                      return p.test(v);
                                    }
                                  },
                                  {view: 'text', label: '姓名', required: 1, name: 'username'},
                                  {view: 'text', label: '密码', type: 'password', required: 1, name: 'password'},
                                  {
                                    cols: [
                                      {
                                        view: 'button', value: '清空',
                                        click: function () {
                                          $$('register:form').clear();
                                        }
                                      },
                                      {
                                        view: 'button', value: '注册',
                                        click: function () {
                                          let form = $$('register:form');
                                          if (form.validate()) {
                                            post('/register', form.getValues()).then(function (r) {
                                              let res = r.json();
                                              if (res.code === 0) {
                                                webix.alert('注册成功！');
                                              }
                                              else {
                                                webix.alert('注册失败！原因：' + res.info);
                                              }
                                            });
                                            $$('register').close();
                                          }
                                        }
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        }).show();
                      }
                    }
                  ]
                }
              ]
            },
            {}
          ]
        },
        {
          rows: [
            {},
            {height: 280, css: 'login-bar'},
            {}
          ]
        }
      ]
    };
  }
}