/*
 * @Explain: 楼栋操作路由-----业务路由
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 20:12:17
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-02 11:17:54
 */
const { Router } = require('express');
const router = new Router();
const BuildingModel = require('../model/buildingModel');
const DormitoryModel = require('../model/dormitoryModel');
const UserModel = require('../model/userModel');
const getNowTime = require('../public/js/getNowTime');
//楼栋模块路由
// 添加楼栋
router.post('/addBuilding', (request, response) => {
    // state:1 为 添加数据成功，0 为 楼栋重复，-1 为 出错
    if (JSON.stringify(request.body) !== '{}') {
        let { bui_id } = request.body;
        BuildingModel.findOne({ bui_id }, (err, data) => {
            if (data) {
                response.send({ state: 0 })
            } else {
                BuildingModel.create({ bui_id, date: getNowTime(new Date()) }, (err, data) => {
                    if (!err) {
                        response.send({ state: 1 })
                    } else {
                        response.send({ state: -1 })
                    }
                })
            }
        })
    } else {
        request.send("非法请求");
    }
});
// 删除楼栋
router.post('/delBuilding', (request, response) => {
    let { bui_id } = request.body;
    DormitoryModel.countDocuments({ bui_id }, (err, data) => {
        if (!err && !data) {
            BuildingModel.findOne({ bui_id }, (err, data) => {
                if (data) {
                    BuildingModel.deleteOne({ bui_id }, (err, data) => {
                        if (!err) {
                            response.send({ state: 1 })
                            return;
                        }
                        response.send({ state: -1 })
                    });
                    return;
                }
                response.send({ state: -1 })
            })
        } else {
            if (err) {
                response.send({ state: -1 })
            } else {
                response.send({ state: 0 })

            }
        }
    });

});
//修改楼栋
router.post('/modBuilding', (request, response) => {
    let { key, bui_id } = request.body;
    BuildingModel.updateOne({ bui_id: key }, { bui_id }, (err, data) => {
        if (!err) {
            if (data) {
                DormitoryModel.updateMany({ bui_id: key }, { bui_id }, (err, data) => {
                    if (data) {
                        UserModel.updateMany({ bui_id: key }, { bui_id }, (err, data) => {
                            if (data) {
                                response.send({ state: 1 })
                            } else {
                                response.send({ state: 0 })
                            }
                        })
                    } else {
                        response.send({ state: 0 })
                    }
                })
                return;
            }
        }
        response.send({ state: 0 })
    });
});
// 获取所有楼栋信息
router.post('/getBuilding', (request, response) => {
    BuildingModel.find({}, { _id: 0, __v: 0 }, { sort: { bui_id: 1 } }, function(err, data) {
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