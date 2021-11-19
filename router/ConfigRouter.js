/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-10-31 11:02:33
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-11-02 14:30:04
 */
const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const ConfigModel = require('../model/configModel');

const router = new Router();
router.get('/getConfig', (request, response) => {
    // 文件方式读取配置
    fs.readFile(path.resolve('./sysConfig.json'), (err, data) => {
        if (!err) {
            response.send({ state: 1, data: JSON.parse(data) });
        } else {
            response.send({ state: 0 });
        }
    });
    // 数据库方式存储和读取配置
    // ConfigModel.findOne({ $or: [{ isFreeChoice: true }, { isFreeChoice: false }] }, (err, data) => {
    //     if (!err) {
    //         response.send({ state: 1, data: data });
    //     } else { response.send({ state: 0 }); }
    // });
})
router.post('/editConfig', (request, response) => {
    // 文件方式修改配置
    let config = {
        isFreeChoice: JSON.parse(request.body.isFreeChoice)
    }
    fs.writeFile(path.resolve('./sysConfig.json'), JSON.stringify(config), (err, data) => {
        if (!err) {
            response.send({ state: 1 });
        } else {
            response.send({ state: 0 });
        }
    });
    // 数据库方式修改配置
    // ConfigModel.updateOne({ $or: [{ isFreeChoice: true }, { isFreeChoice: false }] }, { isFreeChoice: request.body.isFreeChoice }, (err, data) => {
    //     if (!err) {
    //         response.send({ state: 1 })
    //     } else {
    //         response.send({ state: 0 })
    //     }
    // });

})
module.exports = function() {
    return router;
}