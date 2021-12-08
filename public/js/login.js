/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 19:58:00
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-12-08 11:59:46
 */
layui.form.on('submit(login_btn)', function(data) {
    // console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
    // console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
    //console.log(data.field); //当前容器的全部表单字段，名值对形式：{name: value}
    //return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    const WWW = 'http://75bb04ac.cpolar.io'
    $.ajax({
        url: WWW + '/admin',
        method: 'post',
        data: data.field,
        success: function(result) {
            if (result.state === 1 || result.state === 2) {
                layer.msg("登录成功", {
                    time: 1000,
                    icon: 6,
                }, function() {
                    if (result.state === 1) location.assign('/student');
                    else location.assign('/admin');
                });
            } else if (result.state === 0) {
                layer.msg("密码错误", {
                    time: 1000,
                    icon: 5
                });
            } else if (result.state === -1) {
                layer.msg("网络不稳定，请稍后再试", {
                    time: 1000,
                    icon: 5
                });
            } else if (result.state === -2) {
                layer.msg("不存在该账号", {
                    time: 1000,
                    icon: 5
                });
            }
        },
        error: function(err) {
            layer.msg("网络异常", {
                time: 1000,
                icon: 5
            });
        }
    })

});