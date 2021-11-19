/*
 * @Explain: 宿舍操作路由------业务路由
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 20:11:58
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-02 11:18:15
 */
const { Router } = require('express');
const router = new Router();
const DormitoryModel = require('../model/dormitoryModel');
const UserModel = require('../model/userModel');
const getNowTime = require('../public/js/getNowTime');
//宿舍模块路由
// 添加宿舍
router.post('/addDormitory', (request, response) => {
    // state:1 为 添加数据成功，0 为 寝室重复，-1 为 出错
    if (JSON.stringify(request.body) !== '{}') {
        let { bui_id, dor_id, dor_sex, max_num } = request.body;
        DormitoryModel.findOne({ bui_id, dor_id }, (err, data) => {
            if (data) {
                response.send({ state: 0 });
            } else {
                DormitoryModel.create({ bui_id, dor_id, dor_sex, max_num, date: getNowTime(new Date()) }, (err, data) => {
                    if (!err) {
                        response.send({ state: 1 })
                    } else {
                        console.log(err);
                        response.send({ state: -1 })
                    }
                })
            }
        })
    } else {
        request.send("非法请求");
    }
});
// 删除宿舍
router.post('/delDormitory', (request, response) => {
    let { bui_id, dor_id } = request.body;
    // state：1：成功 0：还有学生不能删除 -1：删除出错
    UserModel.countDocuments({ bui_id, dor_id }, (err, data) => {
        if (!err && !data) {
            DormitoryModel.findOne({ bui_id, dor_id }, (err, data) => {
                if (data) {
                    DormitoryModel.deleteOne({ bui_id, dor_id }, (err, data) => {
                        if (!err) {
                            response.send({ state: 1 })
                            return;
                        }
                        console.log(err);
                        response.send({ state: -1 })
                    });
                    return;
                }
                response.send({ state: -1 })
            });
        } else {
            if (err) {
                // 删除出错
                response.send({ state: -1 })
            } else {
                // 宿舍里还有学生，不能删除宿舍
                response.send({ state: 0 })
            }
        }
    });

});
// 修改宿舍
router.post('/modDormitory', (request, response) => {
    let { bui_id, dor_id, cur_num, max_num, dor_sex, key1, key2 } = request.body;
    if (cur_num > max_num) {
        response.send({ state: 0 })
        return;
    }
    // state:1:成功 -1：失败
    DormitoryModel.updateOne({ bui_id: key1, dor_id: key2 }, { bui_id, dor_id, cur_num, max_num, dor_sex }, (err, data) => {
        if (!err) {
            if (data) {
                UserModel.updateMany({ dor_id: key2 }, { dor_id }, (err, data) => {
                    if (data) {
                        response.send({ state: 1 })
                    } else {
                        response.send({ state: -1 })
                    }
                });
                return;
            }
        }
        response.send({ state: -1 })
    });
});
// 获取所有寝室信息
router.post('/getDormitory', (request, response) => {
    // state:1:成功 0：失败
    DormitoryModel.find({}, { _id: 0, __v: 0 }, { sort: { bui_id: 1, dor_id: 1 } }, function(err, data) {
        if (!err) {
            if (data) {
                response.send({ state: 1, data });
                return;
            }
        }
        response.send({ state: 0 })
    })
});

module.exports = function() {
    return router;
}