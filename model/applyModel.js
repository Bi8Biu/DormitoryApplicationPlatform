/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-10-31 13:15:56
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-10-31 15:34:28
 */
// 宿舍申请信息模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApplySchema = new Schema({
    //学号
    sno: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // 楼栋名
    bui_id: {
        type: String,
        required: true
    },
    // 宿舍号
    dor_id: {
        type: Number,
        required: true
    },
    //数据写入数据库的时间
    date: {
        type: String,
        default: ''
    },
    // 这条申请的处理状态
    state: {
        type: String,
        required: true,
        default: '待处理'
    },
    //处理信息
    info: {
        type: String,
        required: true,
        default: '无'
    }
});
const ApplyModel = mongoose.model('apply', ApplySchema);
module.exports = ApplyModel;