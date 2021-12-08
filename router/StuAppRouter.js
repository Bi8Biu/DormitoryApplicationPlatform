/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-02 14:41:35
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-19 14:16:54
 */
// 学生操作宿舍路由器
const { Router } = require('express');
// 创造一个路由器实例
const router = new Router();
//引入模型对象
const UserModel = require('../model/userModel');
const DormitoryModel = require('../model/dormitoryModel');

// 学生退出宿舍
router.get('/exit_dor', (request, response) => {
    if (JSON.stringify(request.query) !== '{}') {
        let { sno, cur_num, bui_id, dor_id } = request.query;
        // 将学生的宿舍信息 改为 '未选择宿舍'
        new Promise((resolve, reject) => {
            UserModel.updateOne({ sno, bui_id, dor_id }, { bui_id: '未选择宿舍', dor_id: '未选择宿舍' }, function(err, data) {
                if (data) {
                    resolve(data)
                } else {
                    reject(err)
                }
            });
        }).then(value => {
            // 将更新宿舍人数
            DormitoryModel.updateOne({ bui_id, dor_id }, { cur_num }, function(err, data) {
                if (data) {
                    response.send({ state: 1 })
                } else {
                    // 宿舍人数更新失败
                    // 将学生信息改回去
                    UserModel.updateOne({ sno }, { bui_id, dor_id });
                    response.send({ state: 0, err: err })
                }
            })
        }, reason => {
            response.send({ state: 0, err: reason })
        })

    } else {
        response.send('非法请求');
    }
});
// 学生选择宿舍
router.post('/choice_dor', (request, response) => {
    // state: 1：选择成功  0：宿舍满员了 -1：出错 -2：不可搬入异性寝室
    if (JSON.stringify(request.body) !== '{}') {
        let { sno, bui_id, dor_id, cur_num, sex } = request.body;
        new Promise((resolve, reject) => {
            DormitoryModel.findOne({ bui_id, dor_id }, function(err, data) {
                if (!err) {
                    resolve(data);
                } else {
                    // 查询宿舍信息出错
                    reject(-1);
                }
            });
        }).then(value => {
            // 判断 所选宿舍是否于自己的性别相符
            return new Promise((resolve, reject) => {
                if (value.dor_sex === sex) {
                    resolve(value)
                } else {
                    // 不可搬入异性寝室
                    reject(-2);
                }
            })
        }).then(value => {
            return new Promise((resolve, reject) => {
                // 判断宿舍是否已满
                if (value.max_num === value.cur_num) {
                    reject(0)
                } else {
                    resolve(value)
                }
            });
        }).then(value => {
            // 修改学生宿舍信息
            return new Promise((resolve, reject) => {
                UserModel.updateOne({ sno }, { bui_id, dor_id }, function(err, data) {
                    if (!err) {
                        resolve(data)
                    } else {
                        // 修改学生宿舍信息出错
                        reject(-1);
                    }
                });
            });

        }).then(value => {
            DormitoryModel.updateOne({ bui_id, dor_id }, { cur_num: Number(cur_num) + 1 }, function(err) {
                if (!err) {
                    // 选择宿舍成功
                    response.send({ state: 1 });
                } else {
                    // 修改宿舍人数失败，将学生宿舍信息变为'未选择宿舍'
                    UserModel.updateOne({ sno }, { bui_id: '未选择宿舍', dor_id: '未选择宿舍' });
                    response.send({ state: -1 });
                }
            })
        }).catch(reason => {
            response.send({ state: reason })
        });
    } else {
        response.send('非法请求');
    }
});
module.exports = function() {
    return router;
}