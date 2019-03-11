/**
 @name: login.js
 @editor: PyCharm
 @Date: 2019/2/26 15:36
 @Author: ly
 @Description:
 */
import {JetView} from "webix-jet";

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
							view: 'form',
							elements: [
								{},
								{view: 'label', label: '用户登录', align: 'center', css: 'login-form-title'},
								{},
								{view: 'text', name: 'username', label: '用户', labelWidth: 50},
								{height: 5},
								{view: 'text', name: 'password', label: '密码', labelWidth: 50, type: 'password'},
								{height: 5},
								{
									view: 'button', value: '登录', type: 'form', click: function () {
										this.$scope.show('/mode');
									}
								},
								{
									cols: [
										{},
										{
											view: 'label', label: '用户注册', width: 70,
											css: 'login-form-register', align: 'center',
											click: function () {
												this.$scope.show('/register');
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