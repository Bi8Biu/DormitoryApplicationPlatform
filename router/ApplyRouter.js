/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-10-31 13:22:18
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-19 14:16:23
 */
const { Router } = require('express');
const ApplyModel = require('../model/applyModel');
const DormitoryModel = require('../model/dormitoryModel');
const UserModel = require('../model/userModel');


const getNowTime = require('../public/js/getNowTime');
const router = new Router();
// 获取申请列表
router.post('/getApply', (requset, response) => {
    let { sno } = requset.body;
    if (sno) {
        // 如果传入了sno，则只查询sno的申请
        ApplyModel.find({ sno }, { _id: 0, __v: 0 }, { sort: { date: -1 } }, (err, data) => {
            if (!err) {
                response.send({ state: 1, data: data })
            } else {
                response.send({ state: 0 })
            }
        })
    } else {
        // 如果没有，则查找所有
        ApplyModel.find({}, { _id: 0, __v: 0 }, { sort: { date: -1 } }, (err, data) => {
            if (!err) {
                response.send({ state: 1, data: data })
            } else {
                response.send({ state: 0 })
            }
        })
    }
});
// 提交申请
router.post('/addApply', (request, response) => {
    const { sno, name, bui_id, dor_id } = request.body;
    ApplyModel.findOne({ sno, state: '待处理' }, (err, data) => {
        if (!err) {
            if (data) {
                // 已经提交过申请，且还没处理，不能提交第二次
                response.send({ state: -1 })
            } else {
                ApplyModel.create({ sno, name, bui_id, dor_id, date: getNowTime(new Date()) }, (err, data) => {
                    if (!err) {
                        response.send({ state: 1 })
                    } else {
                        response.send({ state: 0 })
                    }
                });
            }
        } else {
            response.send({ state: 0 })
        }
    })


});
// 学生撤销申请
router.post('/removeApply', (request, response) => {
    let { sno, name, dor_id, bui_id, date, state, info } = request.body;
    ApplyModel.deleteOne({ sno, name, dor_id, bui_id, date, state, info }, (err) => {
        if (!err) {
            response.send({ state: 1 });
        } else {
            response.send({ state: 0 });
        }
    })
});
// 拒绝申请
router.post('/dosApply', (request, response) => {
    let { sno, name, dor_id, bui_id, date, state, info, newState, newInfo } = request.body;
    ApplyModel.updateOne({ sno, name, dor_id, bui_id, date, state, info }, { state: newState, info: newInfo }, (err) => {
        if (!err) {
            response.send({ state: 1 });
        } else {
            response.send({ state: 0 });
        }
    })
});
// 同意申请
router.post('/agreeApply', (request, response) => {
    let { sno, name, dor_id, bui_id, date, state, info } = request.body;
    // state：错误：0，成功：1，要申请入住的宿舍已满：-1
    // 判断要搬入的寝室是否已满
    new Promise((resolve, reject) => {
        DormitoryModel.findOne({ dor_id, bui_id }, (err, data) => {
            if (!err) {
                if (data.cur_num !== data.max_num) {
                    resolve()
                } else {
                    // 满了
                    response.send({ state: -1 })
                }
            } else {
                console.log('宿舍错误');
                reject(err)
            }
        });
    }).then(() => {
        // 将原宿舍人数 -1
        return new Promise((resolve, reject) => {
            UserModel.findOne({ sno }, (err, data) => {
                if (!err) {
                    DormitoryModel.updateOne({ dor_id: data.dor_id, bui_id: data.bui_id }, { $inc: { cur_num: -1 } }, (err) => {
                        if (!err) {
                            resolve();
                        } else {
                            reject(err);

                        }
                    });
                } else {
                    reject(err);
                }
            })
        })

    }).then(() => {
        // 修改 学生信息,
        return new Promise((resolve, reject) => {
            UserModel.updateOne({ sno }, { dor_id, bui_id }, (err, data) => {
                if (!err) {
                    resolve()
                } else {
                    console.log('修改学生信息错误');
                    reject(err)
                }
            });
        });
    }).then(() => {
        // 将搬去的宿舍人数 +1
        return new Promise((resolve, reject) => {
            DormitoryModel.updateOne({ dor_id, bui_id }, { $inc: { cur_num: 1 } }, (err) => {
                if (!err) {
                    resolve()
                } else {
                    reject(err)
                }
            })
        })

    }).then(() => {
        // 修改申请状态为已同意
        return new Promise((resolve, reject) => {
            ApplyModel.updateOne({ sno, name, dor_id, bui_id, date, state, info }, { state: '已同意' }, (err, data) => {
                if (!err) {
                    response.send({ state: 1 })
                } else {
                    console.log('申请错误');
                    reject(err);
                }
            });
        });

    }).catch(reason => {
        console.log(reason);
        response.send({ state: 0 })
    })
});
module.exports = function() {
    return router;
}