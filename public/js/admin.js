/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-01 19:55:52
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-12-08 12:10:38
 */
$(function() {
    const WWW = 'http://75bb04ac.cpolar.io'
        // 发送 ajax请求，获取用户 姓名等
    let sno = ''
    let userName = '';
    let password = '';
    let sex = '';
    //  获取配置信息
    function gitConfig() {
        $.ajax({
            url: WWW + '/getConfig',
            method: 'get',
            success: (res) => {
                if (res.state === 1) {
                    document.querySelector('#isFreeChoice').checked = res.data.isFreeChoice;
                    layui.form.render('checkbox')
                } else {
                    console.log('获取配置信息失败，null');
                    layer.msg("获取配置信息失败", {
                        time: 1000,
                        icon: 5
                    }, () => {
                        $('#exit').click();
                    });
                }
            },
            error: (err) => {
                console.log('获取配置信息失败', err);
                layer.msg("获取配置信息失败", {
                    time: 1000,
                    icon: 5
                }, () => {
                    $('#exit').click();
                });
            }
        })
    }
    // 获取用户信息
    function getUserInfo() {
        $.ajax({
            url: WWW + '/get_user_info',
            method: 'get',
            success: (result) => {
                if (result.state === 1) {
                    sno = result.data.sno;
                    userName = result.data.name;
                    password = result.data.password;
                    sex = result.data.sex;
                    $('.name').html(userName);
                    $('#stu_num').html(result.num.stuNum);
                    $('#bui_num').html(result.num.buiNum);
                    $('#dor_num').html(result.num.dorNum);
                } else if (result.state === 0) {
                    console.log('获取用户信息失败，null');
                    layer.msg("获取用户信息失败", {
                        time: 1000,
                        icon: 5
                    }, () => {
                        $('#exit').click();
                    });
                }
            },
            error: (err) => {
                console.log('获取用户信息出错，err');
                layer.msg("获取用户信息出错", {
                    time: 1000,
                    icon: 5
                }, () => {
                    $('#exit').click();
                });
            }
        });
    }
    // 初始化信息
    function __init() {
        getUserInfo();
        gitConfig();
    }
    __init();

    // logo 切换 欢迎界面
    let $logo_li = $('.logo_li');
    $logo_li.click(() => {
        for (let i = 0; i < body_div.length; i++) {
            $(body_div[i]).removeClass('current');
        };
        $(body_div[0]).addClass('current');
    });
    // 监听 开启/关闭 学生自主选择宿舍 开关
    layui.form.on('switch(isChoose)', function(data) {
        $.ajax({
            url: WWW + '/editConfig',
            method: 'post',
            data: { 'isFreeChoice': data.elem.checked },
            success: (res) => {
                if (res.state === 1) {
                    layer.msg("设置成功", {
                        time: 1000,
                        icon: 6
                    });
                } else {
                    console.log('设置失败，null');
                    layer.msg("设置失败，请联系管理员", {
                        time: 1000,
                        icon: 5
                    }, () => {
                        $('#exit').click();
                    });
                }
            },
            error: (err) => {
                layer.msg("设置失败，请联系管理员", {
                    time: 1000,
                    icon: 5
                });
            }
        })
    });





    // 学生操作
    // 添加学生
    let stu_add = $('#stu_add');
    stu_add.click(function() {
        window.list_render = 0;
        layer.open({
            type: 2,
            id: 'iframe',
            title: '添加数据',
            skin: 'layui-layer-rim', //加上边框
            area: ['45%', '40%'], //宽高
            content: './iframe/addStudent.html',
            end: function() {
                if (window.list_render === 1) {
                    getStudent();
                    __init();
                }
            }
        });
    });
    // 利用事件委托 对学生列表的删除按钮添加点击事件
    $('#stu_list').on('click', '.layui-btn-danger', function() {
        // 删除学生
        // 获取当前要删除学生的 学号
        let sno = $($(this).parent().siblings()[0]).html();
        // 发起删除请求
        $.ajax({
            url: WWW + '/delStudent',
            method: 'post',
            data: {
                sno
            },
            success: (result) => {
                if (result.state === 1) {
                    // 删除成功
                    layer.msg("删除成功", {
                        time: 1000,
                        icon: 6
                    });
                    getStudent();
                    __init();
                } else {
                    //删除失败
                    layer.msg("删除失败", {
                        time: 1000,
                        icon: 5
                    })
                }
            },
            error: (err) => {
                // 请求发送出错
                layer.msg("异常，请稍后再试", {
                    time: 1000,
                    icon: 5
                })
            }

        })
    });
    // 利用事件委托 对学生列表的修改按钮添加点击事件
    $('#stu_list').on('click', '.layui-btn-normal', function() {
        let tds = $(this).parent().siblings();
        let data = {
            sno: $(tds[0]).html(),
            password: $(tds[1]).html(),
            name: $(tds[2]).html(),
            sex: $(tds[3]).html(),
            bui_id: $(tds[4]).html(),
            dor_id: $(tds[5]).html()
        };
        window.list_render = 0;
        layer.open({
            type: 2,
            id: 'iframe',
            title: '修改数据',
            skin: 'layui-layer-rim', //加上边框
            area: ['50%', '70%'], //宽高
            content: './iframe/modStudent.html',
            success: function(sonDom, index) {
                let sonWindow = $(sonDom[0]).find('iframe')[0].contentWindow;
                // 获取楼栋列表
                $.post(WWW + '/getBuilding', function(result) {
                    if (result.state === 1) {
                        // 渲染拉框
                        let $bui_sel = $(sonWindow.document).find('#bui_sel');
                        let optionHtml = '<option value="未选择宿舍">暂不选择楼栋</option>';
                        for (let i = 0; i < result.data.length; i++) {
                            optionHtml += `<option value="${result.data[i].bui_id}">${result.data[i].bui_id}</option>`;
                        }
                        $bui_sel.html(optionHtml);
                        let $sonInput = $(sonWindow.document).find('input');
                        let $sonBuiOption = $bui_sel.find('option');
                        // 根据数据调整默认选中
                        for (let i = 0; i < $sonBuiOption.length; i++) {
                            if ($sonBuiOption[i].value === data.bui_id) {
                                $sonBuiOption[i].selected = 'selected';
                                break;
                            }
                        }
                        sonWindow.layui.form.render('select');
                        // 获取当前所属的楼栋
                        let cur_dor_id = $(sonWindow.document).find('.layui-form-select').find('.layui-this')[0].getAttribute('lay-value');
                        // 判断是否需要获取寝室列表
                        if (cur_dor_id !== '未选择宿舍') {
                            $.post(WWW + '/getDormitory', (result) => {
                                if (result.state === 1) {
                                    let dor_arr = [];
                                    // 筛选出被选中楼栋下的所有宿舍
                                    for (var i = 0; i < result.data.length; i++) {
                                        if (result.data[i].bui_id === cur_dor_id) {
                                            dor_arr.push(result.data[i])
                                        }
                                    }
                                    // 将筛选好的数据渲染到宿舍下拉框
                                    let $dor_sel = $(sonWindow.document).find('#dor_sel');
                                    let optionHtml = '<option value="未选择宿舍">暂不选择宿舍</option>';
                                    for (let i = 0; i < dor_arr.length; i++) {
                                        optionHtml += `<option value="${dor_arr[i].dor_id}">${dor_arr[i].dor_id}</option>`;
                                    }
                                    $dor_sel.html(optionHtml);
                                    let $sonDorOption = $dor_sel.find('option');
                                    // 调整默认选中
                                    for (let i = 0; i < $sonDorOption.length; i++) {
                                        if ($sonDorOption[i].value === data.dor_id) {
                                            $sonDorOption[i].selected = 'selected';
                                            break;
                                        }
                                    }
                                    sonWindow.layui.form.render('select');
                                } else {
                                    layer.msg("获取宿舍列表失败,请联系管理员", {
                                        time: 1000,
                                        icon: 5
                                    }, function() {
                                        layer.close(index);
                                    });
                                }
                            })
                        }
                        // 渲染表单
                        $sonInput[0].value = data.bui_id;
                        $sonInput[1].value = data.dor_id;
                        $sonInput[2].value = data.sno;
                        $sonInput[3].value = data.name;
                        $sonInput[6].value = data.password;
                        // 性别设置
                        //默认勾选男,若为女生 则勾选 女
                        if (data.sex === '女') {
                            $sonInput[9].checked = true;
                            sonWindow.layui.form.render('radio');
                        }
                    } else {
                        layer.msg("获取楼栋列表失败,请联系管理员", {
                            time: 1000,
                            icon: 5
                        }, function() {
                            layer.close(index);
                        });
                    }
                });
            },
            end: function() {
                if (window.list_render == 1) getStudent()
            }
        });

    });
    // 渲染学生列表函数
    function getStudent() {
        $.post(WWW + "/getStudent", function(result) {
            if (result.state === 1) {
                // 获取学生数据成功，进行渲染
                let stuHtml = '';
                for (let i = 0; i < result.data.length; i++) {
                    stuHtml += `                    
                                <tr>
                                    <td>${result.data[i].sno}</td>
                                    <td>${result.data[i].password}</td>
                                    <td>${result.data[i].name}</td>
                                    <td>${result.data[i].sex}</td>
                                    <td>${result.data[i].bui_id}</td>
                                    <td>${result.data[i].dor_id}</td>
                                    <td>${result.data[i].date}</td>
                                    <td>
                                        <button class="layui-btn layui-btn-normal">修改</button>
                                        <button class="layui-btn layui-btn-danger">删除</button>
                                    </td>
                                </tr>`;
                }
                $('#stu_list').html(stuHtml);
            } else if (result.state === 0) {
                layer.msg("获取学生列表失败", {
                    time: 1000,
                    icon: 5
                })
            }
        });
    }
    // 学生列表的筛选操作
    // 学号筛选
    let last_sno = '';
    // 渲染符合条件的学号 函数
    function renderSno(value) {
        // 判断值是否发生变化
        if (last_sno !== value) {
            last_sno = value;
            let trs = $('#stu_list').children();
            // 移除所有 学号隐藏类
            for (let i = 0; i < trs.length; i++) {
                $(trs[i]).removeClass('sno_tr')
            }
            // 给不符条件的加上 隐藏类
            if (value !== '') {
                for (let i = 0; i < trs.length; i++) {
                    if ($($(trs[i]).children()[0]).html() !== value) {
                        $(trs[i]).addClass('sno_tr');
                    }
                }
            }

        }
    }
    $('#sno').blur(function() {
        // 失去焦点的时候触发
        renderSno(this.value)
    });
    $('#sno').keydown(function(event) {
        // 按下回车触发
        if (event.keyCode === 13) {
            renderSno(this.value);
        }
    });
    // 姓名筛选
    let last_name = '';
    // 渲染符合条件的姓名 函数
    function renderName(value) {
        // 判断值是否发生变化
        if (last_name !== value) {
            last_name = value;
            let trs = $('#stu_list').children();
            // 移除所有 学号隐藏类
            for (let i = 0; i < trs.length; i++) {
                $(trs[i]).removeClass('name_tr')
            }
            // 给不符条件的加上 隐藏类
            if (value !== '') {
                for (let i = 0; i < trs.length; i++) {
                    if ($($(trs[i]).children()[2]).html() !== value) {
                        $(trs[i]).addClass('name_tr');
                    }
                }
            }

        }
    }
    $('#name').blur(function() {
        // 失去焦点时触发
        renderName(this.value);
    });
    $('#name').keydown(function(event) {
        // 按下回车触发
        if (event.keyCode === 13) {
            renderName(this.value);
        }
    });
    // 楼栋&宿舍筛选
    // 获取所有楼栋
    function renderStuSel() {
        let $bui_sel = $('#bui_sel_stu');
        $('#sno').val('');
        $('#name').val('');
        $.post(WWW + '/getBuilding', function(result) {
            if (result.state === 1) {
                let last_bui_sel_stu = '';
                let last_dor_sel = '';
                let optionHtml = '<option value="">按楼栋筛选</option><option value="未选择宿舍">未选择宿舍</option>';
                for (let i = 0; i < result.data.length; i++) {
                    optionHtml += `<option value="${result.data[i].bui_id}">${result.data[i].bui_id}</option>`
                }
                $bui_sel.html(optionHtml);
                layui.form.render('select');
                // 监听楼栋变化
                layui.form.on('select(bui_sel_stu)', function(data) {
                    if (data.value !== last_bui_sel_stu) {
                        // 下拉列表发生变化，需要更新列表
                        let trs = $('#stu_list').children();
                        // 移除所有dor_tr隐藏类
                        for (let i = 0; i < trs.length; i++) {
                            $(trs[i]).removeClass('bui_tr');
                        }
                        last_bui_sel_stu = data.value;

                        if (data.value !== '') {
                            // 渲染对应楼栋下的所有宿舍
                            for (let i = 0; i < trs.length; i++) {
                                if ($($(trs[i]).children()[4]).html() !== data.value) {
                                    $(trs[i]).addClass('bui_tr');
                                }
                            }
                            if (data.value !== '暂未选择宿舍') {
                                // 发请求获取该楼栋下的所有宿舍 并渲染到宿舍筛选列表
                                $.post(WWW + '/getDormitory', (result) => {
                                    if (result.state === 1) {
                                        let dor_arr = [];
                                        // 筛选出被选中楼栋下的所有宿舍
                                        for (var i = 0; i < result.data.length; i++) {
                                            if (result.data[i].bui_id === data.value) {
                                                dor_arr.push(result.data[i])
                                            }
                                        }
                                        // 将筛选好的数据渲染到宿舍下拉框
                                        let $dor_sel = $('#dor_sel');
                                        let optionHtml = '<option value="">按宿舍筛选</option>';
                                        for (let i = 0; i < dor_arr.length; i++) {
                                            optionHtml += `<option value="${dor_arr[i].dor_id}">${dor_arr[i].dor_id}</option>`;
                                        }
                                        $dor_sel.html(optionHtml);
                                        layui.form.render('select');
                                        // 监听宿舍筛选列表变化
                                        layui.form.on('select(dor_sel)', function(data) {
                                            if (data.value !== last_dor_sel) {
                                                // 下拉列表发生变化，需要更新列表
                                                let trs = $('#stu_list').children();
                                                // 移除所有dor_tr隐藏类
                                                for (let i = 0; i < trs.length; i++) {
                                                    $(trs[i]).removeClass('dor_tr');
                                                }
                                                last_dor_sel = data.value;
                                                if (data.value !== '') {
                                                    for (let i = 0; i < trs.length; i++) {
                                                        if ($($(trs[i]).children()[5]).html() !== data.value) {
                                                            $(trs[i]).addClass('dor_tr');
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        layer.msg("获取宿舍列表失败,请联系管理员", {
                                            time: 1000,
                                            icon: 5
                                        });
                                    }
                                })
                            }
                        } else {
                            let $dor_sel = $('#dor_sel');
                            let optionHtml = '<option value="">按宿舍筛选</option>';
                            $dor_sel.html(optionHtml);
                            layui.form.render('select');
                            // 移除所有dor_tr隐藏类
                            let trs = $('#stu_list').children();
                            console.log(trs);
                            for (let i = 0; i < trs.length; i++) {
                                $(trs[i]).removeClass('dor_tr');
                            }
                        }
                    }
                });

            } else {
                layer.msg("获取楼栋列表失败,请联系管理员", {
                    time: 1000,
                    icon: 5
                })
            }
        });
    }
    // 楼栋操作
    // 渲染楼栋列表函数
    function getBuilding() {
        $.post(WWW + "/getBuilding", function(result) {
            if (result.state === 1) {
                // 获取楼栋数据成功，进行渲染
                let buiHtml = '';
                for (let i = 0; i < result.data.length; i++) {
                    buiHtml += `                    
                                <tr>
                                    <td>${result.data[i].bui_id}</td>
                                    <td>${result.data[i].date}</td>
                                    <td>
                                        <button class="layui-btn layui-btn-normal">修改</button>
                                        <button class="layui-btn layui-btn-danger">删除</button>
                                    </td>
                                </tr>`;
                }
                $('#bui_list').html(buiHtml);
            } else if (result.state === 0) {
                layer.msg("获取楼栋列表失败", {
                    time: 1000,
                    icon: 5
                });
            }
        });
    }
    // 添加楼栋
    let bui_add = $('#bui_add');
    bui_add.click(() => {
        window.list_render = 0;
        layer.open({
            type: 2,
            id: 'iframe',
            title: '添加数据',
            skin: 'layui-layer-rim', //加上边框
            area: ['45%', '30%'], //宽高
            content: './iframe/addBuilding.html',
            end: function() {
                if (window.list_render === 1) {
                    getBuilding();
                    __init();
                };
            }
        });
    });
    // 利用事件委托 对楼栋列表的删除按钮添加点击事件
    $('#bui_list').on('click', '.layui-btn-danger', function() {
        //删除操作
        // 获取当前要楼栋的 楼栋名
        let bui_id = $($(this).parent().siblings()[0]).html();
        // 发起删除请求
        $.ajax({
            url: WWW + '/delBuilding',
            method: 'post',
            data: {
                bui_id
            },
            success: (result) => {
                if (result.state === 1) {
                    // 删除成功
                    layer.msg("删除成功", {
                        time: 1000,
                        icon: 6
                    });
                    getBuilding();
                    __init();
                } else if (result.state === -1) {
                    //删除失败
                    layer.msg("删除失败,请稍后再试", {
                        time: 1000,
                        icon: 5
                    })
                } else if (result.state === -0) {
                    layer.msg("删除失败，因为该楼栋下还留有宿舍", {
                        time: 1300,
                        icon: 5
                    })
                }
            },
            error: (err) => {
                // 请求发送出错
                layer.msg("请求异常，请稍后再试", {
                    time: 1000,
                    icon: 5
                })
            }
        })
    });
    // 利用事件委托 对楼栋列表的修改按钮添加点击事件 
    $('#bui_list').on('click', '.layui-btn-normal', function() {
        let bui_id = $($(this).parent().siblings()[0]).html();
        window.list_render = 0;
        layer.open({
            type: 2,
            title: '修改数据',
            id: 'iframe',
            skin: 'layui-layer-rim', //加上边框
            area: ['45%', '30%'], //宽高
            content: './iframe/modBuilding.html',
            success: function(sonDom, index) {
                let sonWindow = $(sonDom[0]).find('iframe')[0].contentWindow;
                let $sonInput = $(sonWindow.document).find('input');
                // 渲染表单
                $sonInput[0].value = bui_id;
                $sonInput[1].value = bui_id;
            },
            end: function() {
                if (window.list_render == 1) getBuilding()
            }
        });
    });

    // 宿舍操作
    // 渲染宿舍列表函数
    function getDormitory() {
        $.post(WWW + "/getDormitory", function(result) {
            if (result.state === 1) {
                // 获取寝室数据成功，进行渲染
                let dorHtml = '';
                for (let i = 0; i < result.data.length; i++) {
                    dorHtml += `                    
                                <tr>
                                    <td>${result.data[i].bui_id}</td>
                                    <td>${result.data[i].dor_id}</td>
                                    <td>${result.data[i].cur_num}</td>
                                    <td>${result.data[i].max_num}</td>
                                    <td>${result.data[i].dor_sex}</td>
                                    <td>${result.data[i].date}</td>
                                    <td>
                                        <button class="layui-btn layui-btn-normal">修改</button>
                                        <button class="layui-btn layui-btn-danger">删除</button>
                                    </td>
                                </tr>`;
                }
                $('#dor_list').html(dorHtml);
            } else if (result.state === 0) {
                layer.msg("获取宿舍列表失败", {
                    time: 1000,
                    icon: 5
                })
            }
        });
    }

    // 添加宿舍
    let dor_add = $('#dor_add');
    dor_add.click(() => {
        window.list_render = 0;
        layer.open({
            type: 2,
            id: 'iframe',
            title: '添加数据',
            skin: 'layui-layer-rim', //加上边框
            area: ['50%', '60%'], //宽高
            content: './iframe/addDormitory.html',
            end: function() {
                if (window.list_render === 1) {
                    getDormitory();
                    __init();
                };
            }
        });
    });
    // 利用事件委托 对楼栋列表的删除按钮添加点击事件
    $('#dor_list').on('click', '.layui-btn-danger', function() {
        //删除操作
        // 获取当前  楼栋名 寝室号
        let bui_id = $($(this).parent().siblings()[0]).html();
        let dor_id = $($(this).parent().siblings()[1]).html();
        // 发起删除请求
        $.ajax({
            url: WWW + '/delDormitory',
            method: 'post',
            data: {
                bui_id,
                dor_id
            },
            success: (result) => {
                if (result.state === 1) {
                    // 删除成功
                    layer.msg("删除成功", {
                        time: 1000,
                        icon: 6
                    });
                    getDormitory();
                    __init();
                } else if (result.state === -1) {
                    //删除失败
                    layer.msg("删除失败,请稍后再试", {
                        time: 1000,
                        icon: 5
                    })
                } else if (result.state === 0) {
                    layer.msg("删除失败，因为该宿舍还住有学生", {
                        time: 1300,
                        icon: 5
                    })
                }
            },
            error: (err) => {
                // 请求发送出错
                layer.msg("请求异常，请稍后再试", {
                    time: 1000,
                    icon: 5
                })
            }
        })
    });
    // 利用事件委托 对宿舍列表的修改按钮添加点击事件 
    $('#dor_list').on('click', '.layui-btn-normal', function() {
        let bui_id = $($(this).parent().siblings()[0]).html();
        let dor_id = $($(this).parent().siblings()[1]).html();
        let cur_num = $($(this).parent().siblings()[2]).html();
        let max_num = $($(this).parent().siblings()[3]).html();
        let dor_sex = $($(this).parent().siblings()[4]).html();
        window.list_render = 0;
        layer.open({
            type: 2,
            id: 'iframe',
            title: '修改数据',
            skin: 'layui-layer-rim', //加上边框
            area: ['50%', '60%'], //宽高
            content: './iframe/modDormitory.html',
            success: function(sonDom, index) {
                setTimeout(() => {
                    let sonWindow = $(sonDom[0]).find('iframe')[0].contentWindow;
                    let $sonInput = $(sonWindow.document).find('input');
                    let $sonOption = $(sonWindow.document).find('#bui_sel').find('option');
                    // 渲染拉框
                    for (let i = 0; i < $sonOption.length; i++) {
                        if ($sonOption[i].value === bui_id) {
                            $sonOption[i].selected = 'selected';
                            sonWindow.layui.form.render('select');
                            break;
                        }
                    }
                    // 渲染 表单
                    $sonInput[1].value = dor_id;
                    $sonInput[2].value = cur_num;
                    $sonInput[3].value = max_num;
                    $sonInput[6].value = bui_id;
                    $sonInput[7].value = dor_id;
                    if (dor_sex === '女') {
                        $sonInput[5].checked = true;
                        sonWindow.layui.form.render('radio');
                    }
                }, 20);
            },
            end: function() {
                if (window.list_render == 1) getDormitory()
            }
        });
    });
    // 宿舍筛选
    function renderDorSel() {
        let defOption = $('.default');
        defOption[0].selected = 'selected';
        defOption[1].selected = 'selected';
        layui.form.render('select')
        $.post(WWW + '/getBuilding', function(result) {
            if (result.state === 1) {
                let $bui_sel = $('#bui_sel');
                let optionHtml = '<option value="">楼栋筛选</option>';
                for (let i = 0; i < result.data.length; i++) {
                    optionHtml += `<option value="${result.data[i].bui_id}">${result.data[i].bui_id}</option>`
                }
                $bui_sel.html(optionHtml);
                layui.form.render('select');
                let last_bui_sel = '';
                let last_sex_sel = '';
                let last_flag_sel = '';
                // 注册筛选事件
                layui.form.on('select(bui_sel)', function(data) {
                    if (data.value !== last_bui_sel) {
                        // 下拉列表发生变化，需要更新列表

                        let trs = $('#dor_list').children();
                        // 移除所有dor_tr隐藏类
                        for (let i = 0; i < trs.length; i++) {
                            $(trs[i]).removeClass('dor_tr');
                        }
                        last_bui_sel = data.value;
                        if (last_bui_sel !== '') {
                            for (let i = 0; i < trs.length; i++) {
                                if ($($(trs[i]).children()[0]).html() !== last_bui_sel) {
                                    $(trs[i]).addClass('dor_tr');
                                }
                            }
                        }

                    }
                });
                layui.form.on('select(dor_sex_sel)', function(data) {
                    if (data.value !== last_sex_sel) {
                        // 下拉列表发生变化，需要更新列表

                        let trs = $('#dor_list').children();
                        // 移除所有sex_tr隐藏类
                        for (let i = 0; i < trs.length; i++) {
                            $(trs[i]).removeClass('sex_tr');
                        }
                        last_sex_sel = data.value;
                        if (last_sex_sel !== '') {
                            for (let i = 0; i < trs.length; i++) {
                                if ($($(trs[i]).children()[4]).html() !== last_sex_sel) {
                                    $(trs[i]).addClass('sex_tr');
                                }
                            }
                        }

                    }
                });
                layui.form.on('select(flag_sel)', function(data) {
                    if (data.value !== last_flag_sel) {
                        // 下拉列表发生变化，需要更新列表

                        let trs = $('#dor_list').children();
                        // 移除所有flag_tr隐藏类
                        for (let i = 0; i < trs.length; i++) {
                            $(trs[i]).removeClass('flag_tr');
                        }
                        last_flag_sel = data.value;
                        if (last_flag_sel !== '') {
                            for (let i = 0; i < trs.length; i++) {
                                if (last_flag_sel === '1') {
                                    //查看没满的寝室，将满了的寝室隐藏
                                    if ($($(trs[i]).children()[2]).html() === $($(trs[i]).children()[3]).html()) {
                                        $(trs[i]).addClass('flag_tr')
                                    }
                                } else {
                                    //查看满员的寝室，将没满的寝室隐藏
                                    if ($($(trs[i]).children()[2]).html() !== $($(trs[i]).children()[3]).html()) {
                                        $(trs[i]).addClass('flag_tr')
                                    }
                                }

                            }
                        }

                    }
                });
            } else {
                layer.msg("获取楼栋列表失败,请联系管理员", {
                    time: 1000,
                    icon: 5
                })
            }
        });
    }


    // 渲染申请列表
    function getApply() {
        $('#apply_list').html('');
        $.ajax({
            url: WWW + '/getApply',
            method: 'post',
            data: {},
            success: function(res) {
                if (res.state === 1) {
                    let applyHtml = '';
                    for (v of res.data) {
                        applyHtml += `<tr>
                                            <td>${v.sno}</td>
                                            <td>${v.name}</td>
                                            <td>${v.dor_id}</td>
                                            <td>${v.bui_id}</td>
                                            <td>${v.date}</td>
                                            <td>${v.state}</td>
                                            <td>${v.info}</td>
                                            `;
                        if (v.state === '待处理') {
                            applyHtml += `  <td>
                                                <button type="button" class="layui-btn layui-btn-normal">同意申请</button>
                                                <button type="button" class="layui-btn layui-btn-danger">拒绝申请</button>
                                        </tr>`;
                        } else {
                            applyHtml += `  <td>
                                                <button class="layui-btn layui-btn-disabled" style="width:200px">已处理</button></td>
                                        </tr>`;
                        }
                    }
                    $('#apply_list').html(applyHtml);
                } else {
                    console.log(res);
                    layer.msg("数据请求失败，请稍后再试", {
                        time: 1000,
                        icon: 5
                    })
                }
            },
            error: function(err) {
                layer.msg("数据请求失败，请稍后再试", {
                    time: 1000,
                    icon: 5
                })
            }
        })
    }
    // 利用事件委托 对申请列表的拒绝按钮添加点击事件
    $('#apply_list').on('click', '.layui-btn-danger', function() {
        let postBody = {}
        postBody.sno = $(this).parent().siblings()[0].innerText;
        postBody.name = $(this).parent().siblings()[1].innerText;
        postBody.dor_id = $(this).parent().siblings()[2].innerText;
        postBody.bui_id = $(this).parent().siblings()[3].innerText;
        postBody.date = $(this).parent().siblings()[4].innerText;
        postBody.state = $(this).parent().siblings()[5].innerText;
        postBody.info = $(this).parent().siblings()[6].innerText;
        postBody.newState = '已拒绝';
        layer.confirm('是否要添加拒绝申请的原因?', {
            title: '',
            btn: ['是', '否'] //按钮
        }, () => {
            layer.prompt({
                title: '填写原因'
            }, function(pass, index) {
                postBody.newInfo = pass;
                $.ajax({
                    url: WWW + '/dosApply',
                    method: 'post',
                    data: postBody,
                    success: function(res) {
                        if (res.state === 1) {
                            layer.msg('处理成功', {
                                time: 1000,
                                icon: 6
                            }, () => {
                                getApply();
                                layer.close(index)
                            })
                        } else {
                            layer.msg('处理失败', {
                                time: 1000,
                                icon: 5
                            }, () => {
                                layer.close(index)
                            })
                        }
                    },
                    error: function(err) {
                        layer.msg("处理失败", {
                            time: 1000,
                            icon: 5
                        })
                    }
                });
            });
        }, () => {
            postBody.newInfo = '无';
            $.ajax({
                url: WWW + '/dosApply',
                method: 'post',
                data: postBody,
                success: function(res) {
                    if (res.state === 1) {
                        layer.msg('处理成功', {
                            time: 1000,
                            icon: 6
                        }, () => {
                            getApply();
                        })
                    } else {
                        layer.msg("处理失败", {
                            time: 1000,
                            icon: 5
                        })
                    }
                },
                error: function(err) {
                    layer.msg("处理失败", {
                        time: 1000,
                        icon: 5
                    })
                }
            });
        });
    });
    // 利用事件委托 对申请列表的同意按钮添加点击事件
    $('#apply_list').on('click', '.layui-btn-normal', function() {
        let postBody = {}
        postBody.sno = $(this).parent().siblings()[0].innerText;
        postBody.name = $(this).parent().siblings()[1].innerText;
        postBody.dor_id = $(this).parent().siblings()[2].innerText;
        postBody.bui_id = $(this).parent().siblings()[3].innerText;
        postBody.date = $(this).parent().siblings()[4].innerText;
        postBody.state = $(this).parent().siblings()[5].innerText;
        postBody.info = $(this).parent().siblings()[6].innerText;
        $.ajax({
            url: WWW + '/agreeApply',
            method: 'post',
            data: postBody,
            success: function(res) {
                if (res.state === 1) {
                    layer.msg("处理成功", {
                        time: 1000,
                        icon: 6
                    }, () => {
                        getApply();
                    });

                } else if (res.state === -1) {
                    layer.msg("处理失败，要搬入的宿舍已满", {
                        time: 2000,
                        icon: 5
                    })
                } else {
                    console.log(1)
                    layer.msg("处理失败", {
                        time: 1000,
                        icon: 5
                    })
                }
            },
            error: function(err) {
                layer.msg("处理失败", {
                    time: 1000,
                    icon: 5
                })
            }
        });
    });
    // 侧边栏切换
    let body_div = $('.layui-body').children();
    layui.element.on('nav(side)', function(elem) {
        for (let i = 0; i < body_div.length; i++) {
            $(body_div[i]).removeClass('current');
        };
        let index = elem.context.innerText;
        if (index === '学生列表') {
            $(body_div[1]).addClass('current');
            renderStuSel();
            getStudent();
            return;
        }
        if (index === '楼栋列表') {
            $(body_div[2]).addClass('current');
            getBuilding();
            return;
        }
        if (index === '宿舍列表') {
            $(body_div[3]).addClass('current');
            renderDorSel();
            getDormitory();
            return;
        }
        if (index === '申请列表') {
            $(body_div[4]).addClass('current');
            getApply();
            return;
        }
    });

    // 修改密码
    let $edit = $('#edit');
    $edit.click(() => {
        layer.open({
            type: 2,
            id: 'iframe',
            title: '修改个人信息',
            skin: 'layui-layer-rim', //加上边框
            area: ['50%', '50%'], //宽高
            content: './iframe/modPassword.html',
            success: function(sonDom, index) {
                let sonWindow = $(sonDom[0]).find('iframe')[0].contentWindow;
                let $sonInput = $(sonWindow.document).find('input');
                // 渲染表单
                $sonInput[0].value = sno;
                $sonInput[1].value = userName;
                $sonInput[2].value = password;
                // 性别设置
                //默认勾选男,若为女生 则勾选 女
                if (sex === '女') {
                    $sonInput[5].checked = true;
                    sonWindow.layui.form.render('radio');
                }
            },
            end: function() {
                if (window.list_render == 1) {
                    layer.msg("修改个人信息成功，请重新登录", {
                        time: 1500,
                        icon: 6
                    }, () => {
                        $('#exit').click();
                    });
                }
            }
        });
    });

    // 退出

    $('#exit').click(() => {
        $.get(WWW + '/exit', function(result) {
            if (result.state === 1) {
                location.assign(WWW + '');
            } else {
                console.log('退出登陆时出错！请稍后再试');
            }
        })
    });

    // 欢迎xxx,获取时间函数
    function wel_time() {
        let time = document.querySelector("#time");
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let h = date.getHours();
        let m = date.getMinutes();
        let s = date.getSeconds();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        if (m < 10) {
            m = "0" + m
        }
        if (h < 10) {
            h = "0" + h
        }
        setInterval(function() {
            s++;
            if (s == 60) {
                s = 0;
                m++;
                if (m == 60) {
                    m = 0;
                    h++;
                    if (h == 24) {
                        h = 0;
                        day++;
                        if (day < 10) {
                            day = "0" + day;
                        }
                    }
                    if (h < 10) {
                        h = "0" + h;
                    }
                }
                if (m < 10) {
                    m = "0" + m;
                }
            }
            if (s < 10) {
                s = "0" + s
            }
            let str = `${year}-${month}-${day} ${h}:${m}:${s}`;
            time.innerHTML = str;
        }, 1000);
    }
    wel_time();
});