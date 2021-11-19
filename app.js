/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-07-25 20:58:16
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-10-31 14:31:12
 */
const express = require('express');
const app = express();
// 引入express-session模块：操作session
const session = require('express-session');
// 引入connect-mongo模块：session持久化
const MongoStore = require('connect-mongo');

// 引入路由器
const LoginRouter = require('./router/LoginRouter');
const studentRouter = require('./router/StudentRouter');
const UIRouter = require('./router/UIRouter');
const BuildingRouter = require('./router/BuildingRouter');
const DormitoryRouter = require('./router/DormitoryRouter');
const StuAppRouter = require('./router/StuAppRouter');
const ConfigRouter = require('./router/ConfigRouter');
const ApplyRouter = require('./router/ApplyRouter');



// 编写session全局配置对象：
app.use(session({
    name: 'option', // 设置cookie的name，默认值是：connect.sid
    secret: 'SuperLy', // 参与加密的字符串（又称签名）
    saveUninitialized: false, // 是否在存储内容之前创建会话，默认为 true
    resave: true, // 是否在每次请求时，强制重新保存session，即使他们没有变化
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/ly', // 数据库地址/数据库名
        touchAfter: 24 * 3600 // session持久化 修改频率（例：在24小时之内只更新一次）
    }),
    cookie: {
        httpOnly: true, // 开启后前端无法通过 JS 操作cookie
        maxAge: 1000 * 60 * 30 // 设置cookie的过期时间  30分钟
    },
}));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
const db = require('./DB/db');
db(() => {
    app.use(LoginRouter());
    app.use(UIRouter());
    app.use(studentRouter());
    app.use(BuildingRouter());
    app.use(DormitoryRouter());
    app.use(StuAppRouter());
    app.use(ConfigRouter());
    app.use(ApplyRouter());
    app.listen(3000, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('服务器启动成功！');
        }
    });
});