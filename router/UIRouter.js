/*
 * @Explain: UI路由
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 20:11:03
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-02 11:19:06
 */
const { Router } = require('express');
const router = new Router();
const path = require('path');
const UserModel = require('../model/userModel');

router.get('/', (request, response) => {
    let url = path.resolve(__dirname, '../public/login.html')
    response.sendFile(url)
});

// 管理员界面
router.get('/admin', (request, response) => {
    if (request.session) {
        const { sno } = request.session;
        UserModel.findOne({ sno }, (err, data) => {
            if (!err) {
                if (data) {
                    if (data.identity === 1) {
                        let url = path.resolve(__dirname, '../public/admin.html')
                        response.sendFile(url)
                    } else {
                        response.redirect("http://localhost:3000/student");
                    }
                    return;
                }
            }
            response.redirect("http://localhost:3000");
        })
    } else {
        response.redirect("http://localhost:3000");
    }
});
// 学生界面
router.get('/student', (request, response) => {
    if (request.session) {
        const { sno } = request.session;
        UserModel.findOne({ sno }, (err, data) => {
            if (!err) {
                if (data) {
                    if (data.identity === 0) {
                        let url = path.resolve(__dirname, '../public/student.html')
                        response.sendFile(url)
                    } else {
                        response.redirect("http://localhost:3000/admin");
                    }
                    return;
                }
            }
            response.redirect("http://localhost:3000");
        })
    } else {
        response.redirect("http://localhost:3000");
    }

});
module.exports = function() {
    return router;
}