/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-07-31 14:04:13
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-02 11:14:50
 */
// 学生模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    //学号
    sno: {
        type: String,
        unique: true,
        required: true
    },
    // 密码
    password: {
        type: String,
        required: true
    },
    // 姓名
    name: {
        type: String,
        required: true
    },
    // 性别
    sex: {
        type: String,
        required: true
    },
    // 楼栋号
    bui_id: {
        type: String,
        default: '未选择宿舍'
    },
    //宿舍号
    dor_id: {
        type: String,
        default: '未选择宿舍'
    },
    //身份：0表示学生，1表示管理员
    identity: {
        type: Number,
        default: 0
    },
    //数据写入数据库的时间
    date: {
        type: String,
        default: ''
    }
});
const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;