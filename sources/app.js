// Put webix and css import here to minimize index.html
import * as webix from 'webix';
// these need mini-css-extract-plugin & file-load to compile
import 'webix/skins/material.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // if you need to use fa
import './styles/app.css';

import {JetApp, EmptyRouter, HashRouter } from 'webix-jet';

export default class MyApp extends JetApp{
  constructor(config){
    const defaults = {
      id 		: APPNAME,
      version : VERSION,
      router 	: BUILD_AS_MODULE ? EmptyRouter : HashRouter,
      debug 	: !PRODUCTION,
      start 	: '/login',
      webix   : webix
    };     
    super({ ...defaults, ...config });
    webix.i18n.setLocale("zh-CN");
  }
}

if (!BUILD_AS_MODULE){
  webix.ready(() => new MyApp().render() );
}