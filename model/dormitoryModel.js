/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-07-31 14:05:05
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-08-01 21:03:08
 */
// 宿舍模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DormitorySchema = new Schema({
    //宿舍号
    dor_id: {
        type: String,
        unique: true,
    },
    // 楼栋名
    bui_id: {
        type: String,
        unique: true,
    },
    max_num: {
        type: Number,
        required: true
    },
    cur_num: {
        type: Number,
        default: 0
    },
    dor_sex: {
        type: String,
        required: true
    },
    //数据写入数据库的时间
    date: {
        type: String,
        default: ''
    }
});
const DormitoryModel = mongoose.model('dormitory', DormitorySchema);
module.exports = DormitoryModel;