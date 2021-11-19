/*
 * @Explain: 登录验证路由-------业务路由
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 20:15:29
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-02 11:18:28
 */
const { Router } = require('express');
// 创造一个路由器实例
const router = new Router();
//引入模型对象
const UserModel = require('../model/userModel');
const BuildingModel = require('../model/buildingModel');
const DormitoryModel = require('../model/dormitoryModel');

// 登录验证
router.post('/admin', (request, response) => {
    // 查询数据库 登录逻辑
    // state:1为学生登录成功，2为管理员登陆成功，0 为 密码错误，-1 为 出错，-2 为 不存在该账号
    if (JSON.stringify(request.body) !== '{}') {
        let { username, password } = request.body;
        UserModel.findOne({ sno: username }, function(err, data) {
            if (!err) {
                if (data.password === password) {
                    //登录成功 种 cookie 和 session
                    request.session.sno = data.sno;
                    //验证身份
                    if (data.identity === 1) {
                        //管理员
                        response.send({ state: 2 })
                    } else {
                        // 学生
                        response.send({ state: 1 })
                    }
                } else {
                    response.send({ state: -0 })
                }

            } else {
                response.send({ state: -2 })

            }
        })
    } else {
        response.send("非法请求！")
    }
});
// 获取用户信息 和 统计每个集合中文档个数
router.get('/get_user_info', (request, response) => {
    if (request.session) {
        let { sno } = request.session;
        let flag = true
        let num = {};
        UserModel.countDocuments({ identity: 0 }, function(err, data) {
            if (err) {
                flag = false;
            } else {
                num.stuNum = data;
            }
        });
        BuildingModel.countDocuments({}, function(err, data) {
            if (err) {
                flag = false;
            } else {
                num.buiNum = data;
            }
        });
        DormitoryModel.countDocuments({}, function(err, data) {
            if (err) {
                flag = false;
            } else {
                num.dorNum = data;
            }
        });
        UserModel.findOne({ sno }, { _id: 0, identity: 0, date: 0, __v: 0 }, (err, data) => {
            if (!err) {
                if (data) {
                    if (flag) {
                        response.send({ state: 1, data, num }); // state:0：出错，1：成功
                    } else {
                        response.send({ state: 0 })
                    }
                    return;
                }
            }
            response.send({ state: 0 })
        })
    } else {
        response.redirect("http://localhost:3000");
    }

});
// 获取当前宿舍信息
router.get('/get_dor_info', (request, response) => {
    if (JSON.stringify(request.query) !== '{}') {
        let { dor_id, bui_id } = request.query;
        DormitoryModel.findOne({ dor_id, bui_id }, { max_num: 1, cur_num: 1, dor_sex: 1, _id: 0 }, function(err, data) {
            if (data) {
                response.send({ state: 1, data })
            } else {
                response.send({ state: 0 })
            }
        });
    } else {
        response.send('非法请求');
    }

});
// 获取室友信息
router.get('/get_roommate', (request, response) => {
    if (JSON.stringify(request.query) !== '{}') {
        let { dor_id, bui_id } = request.query;
        UserModel.find({ dor_id, bui_id }, { name: 1, _id: 0 }, function(err, data) {
            if (data) {
                response.send({ state: 1, data })
            } else {
                response.send({ state: 0 })
            }
        });
    } else {
        response.send('非法请求');
    }
});
// 退出登录 清除 cookie session
router.get('/exit', (request, response) => {
    // 销毁session
    request.session.destroy(function(err) {
        if (err) {
            console.log('退出登陆时，销毁session出错！');
        } else {
            console.log('退出登陆时，销毁session成功！');
        }
    });
    // 清除 cookie
    response.clearCookie('option');
    response.send({ state: 1 });
})
module.exports = function() {
    return router;
}