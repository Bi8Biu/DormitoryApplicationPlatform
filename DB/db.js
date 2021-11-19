/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-07-31 14:03:38
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-04 19:11:55
 */
const mongoose = require('mongoose'); //引入mongoose
const IP = 'localhost' //数据库地址
const PORT = '27017'; //数据库端口
const DB_NAME = 'ly'; // 数据库名称


function connectMongo(success, failed) {
    mongoose.set("useCreateIndex", true);
    mongoose.connect(`mongodb://${IP}:${PORT}/${DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function(err) {
        if (err) failed('数据库连接失败！' + err)
        else {
            console.log('数据库连接成功！');
            success()
        };
    })
}
module.exports = connectMongo;