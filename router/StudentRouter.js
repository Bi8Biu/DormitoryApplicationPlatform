/*
 * @Explain:  学生操作路由------业务路由
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 20:11:23
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-02 14:26:39
 */
const { Router } = require('express');
const router = new Router();
const UserModel = require('../model/userModel');
const DormitoryModel = require('../model/dormitoryModel');
const getNowTime = require('../public/js/getNowTime');
//学生模块路由
// 增加学生
router.post('/addStudent', (request, response) => {
    // state:1 为 添加数据成功，0 为 学号重复，-1 为 出错
    if (JSON.stringify(request.body) !== '{}') {
        let { sno, name, password, sex } = request.body;
        UserModel.findOne({ sno }, function(err, data) {
            if (!err) {
                if (data) {
                    response.send({ state: 0 })
                } else {
                    // 操作数据库 增加学生
                    UserModel.create({ sno, name, password, sex, date: getNowTime(new Date()) }, function(err) {
                        if (!err) {
                            response.send({ state: 1 })
                        } else {
                            console.log(err);
                            response.send({ state: -1 })
                        }
                    })
                }
            } else {
                console.log(err);
                response.send({ state: -1 })
            }
        })
    } else {
        response.send('非法请求！')
    }
});
// 删除学生
router.post('/delStudent', (request, response) => {
    let { sno } = request.body;
    UserModel.findOne({ sno }, (err, data) => {
        if (data) {
            let { dor_id, bui_id } = data;
            UserModel.deleteOne({ sno }, (err, data) => {
                if (!err) {
                    DormitoryModel.updateOne({ dor_id, bui_id }, { $inc: { cur_num: -1 } }, (err, data) => {
                        if (data) {
                            response.send({ state: 1 })
                        } else {
                            response.send({ state: 0 });
                        }
                    });
                    return;
                }
                response.send({ state: 0 })
            });
            return;
        }
        response.send({ state: 0 })
    })
});
// 修改学生
router.post('/modStudent', (request, response) => {
    let { sno, name, password, sex, bui_id, dor_id, old_bui_id, old_dor_id } = request.body;
    // 如果改变了宿舍 
    if (bui_id !== old_bui_id || dor_id !== old_dor_id) {
        DormitoryModel.findOne({ bui_id, dor_id }, { cur_num: 1, max_num: 1, dor_sex: 1, _id: 0 }, (err, data) => {
            // 判断是否和寝室对应性别一致
            if (sex === data.dor_sex) {
                // 查询 要搬入的宿舍 是否有床位 否则不允许修改宿舍信息
                if (data.cur_num < data.max_num) {
                    //可以搬入
                    // 搬入前将 搬出宿舍 人数 -1 搬入宿舍 人数 +1
                    DormitoryModel.updateOne({ bui_id: old_bui_id, dor_id: old_dor_id }, { $inc: { cur_num: -1 } }, (err, data) => {
                        if (data) {
                            // +1
                            DormitoryModel.updateOne({ bui_id, dor_id }, { $inc: { cur_num: 1 } }, (err, data) => {
                                if (data) {
                                    UserModel.updateOne({ sno }, { name, password, sex, bui_id, dor_id }, (err, data) => {
                                        if (!err) {
                                            if (data) {
                                                // 需要将原宿舍人数 -1 新宿舍人数 +1
                                                response.send({ state: 1 });
                                                return;
                                            }
                                        }
                                        response.send({ state: -1 })
                                    });
                                } else {
                                    response.send({ state: -1 })
                                }
                            })
                        } else {
                            response.send({ state: -1 })
                        }
                    });
                } else {
                    // 没床位，不可以搬入
                    response.send({ state: 0 })
                }
            } else {
                // 性别不符，不可搬入
                response.send({ state: -2 })
            }
        })
    } else {
        UserModel.updateOne({ sno }, { name, password, sex }, (err, data) => {
            if (!err) {
                if (data) {
                    response.send({ state: 1 });
                    return;
                }
            }
            response.send({ state: -1 })
        });
    }
});
//  获取所有学生
router.post('/getStudent', (request, response) => {
    UserModel.find({ identity: 0 }, { _id: 0, identity: 0, __v: 0 }, { sort: { sno: 1 } }, function(err, data) {
        if (!err) {
            if (data) {
                response.send({ state: 1, data });
                return;
            }
        }
        response.send({ state: 0 })
    });
});
module.exports = function() {
    return router;
}