/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-10-31 11:00:08
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-10-31 11:12:17
 */
// 配置模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ConfigSchema = new Schema({
    isFreeChoice: {
        type: Boolean,
        default: false
    },
    //数据写入数据库的时间
    date: {
        type: String,
        default: ''
    }
});
const ConfigModul = mongoose.model('config', ConfigSchema);
module.exports = ConfigModul;