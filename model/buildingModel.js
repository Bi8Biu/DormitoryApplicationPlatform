/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-07-31 14:05:40
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-08-01 21:02:29
 */
// 楼栋模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BuildingSchema = new Schema({
    //楼栋名
    bui_id: {
        type: String,
        unique: true,
        required: true
    },
    //数据写入数据库的时间
    date: {
        type: String,
        default: ''
    }
});
const BuildingModel = mongoose.model('building', BuildingSchema);
module.exports = BuildingModel;