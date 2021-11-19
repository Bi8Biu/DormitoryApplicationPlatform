/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 20:32:08
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-10-30 16:04:43
 */ // 获取当前时间
function getNowTime(d) {
    let dateTime
    let yy = d.getFullYear(); // 年
    let mm = d.getMonth() + 1; // 月
    let dd = d.getDate(); // 日
    let hh = d.getHours(); // 时
    let mf = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes(); // 分
    let ss = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds(); // 秒
    dateTime = yy + '-' + mm + '-' + dd + ' ' + hh + ':' + mf + ':' + ss; // 拼接
    return dateTime
}
module.exports = getNowTime;