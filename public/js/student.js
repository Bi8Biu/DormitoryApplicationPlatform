/*
 * @Explain: 
 * @version: 
 * @Author: SuperLy
 * @Date: 2021-08-02 17:36:26
 * @LastEditors: SuperLy
 * @LastEditTime: 2021-12-08 12:14:37
 */
$(function() {
    const WWW = 'http://75bb04ac.cpolar.io'
    let sno = ''
    let userName = '';
    let password = '';
    let sex = '';
    let dor_id = '未选择宿舍';
    let bui_id = '未选择宿舍';
    let cur_num = 0;
    let max_num = 0;

    // 获取管理员是否开启自由选择宿舍模式，返回一个promise对象，请求成功且开启自由选择模式才能选择和退出宿舍
    function isFreeChoice() {
        return new Promise((resolve, rejiect) => {
            $.ajax({
                url: WWW + '/getConfig',
                method: 'get',
                success: (res) => {
                    if (res.state === 1) {
                        resolve(res.data.isFreeChoice)
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
            });
        })

    }
    isFreeChoice().then(value => {
        if (value) {
            $('.admin_msg')[0].children[0].innerText = '管理员：已开启自由选择宿舍权限，同学们可自由选择宿舍';
        } else {
            $('.admin_msg')[0].children[0].innerText = '管理员：已关闭自由选择宿舍权限，同学们要换宿舍请提交申请';
        }
    })


    //渲染筛选列表
    // 获取 所有tr
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
                                console.log(1);
                                if ($($(trs[i]).children()[2]).html() === $($(trs[i]).children()[3]).html()) {
                                    $(trs[i]).addClass('flag_tr')
                                }
                            } else {
                                //查看满员的寝室，将没满的寝室隐藏
                                console.log(2);
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
    //封装更新数据函数，用于操作数据库前确保数据是最新的
    function updateDate(callback, that) {
        // 更新数据
        // 更新用户数据
        $.ajax({
            url: WWW + '/get_user_info',
            method: 'get',
            success: (result) => {
                if (result.state === 1) {
                    sno = result.data.sno;
                    userName = result.data.name;
                    password = result.data.password;
                    sex = result.data.sex;
                    dor_id = result.data.dor_id;
                    bui_id = result.data.bui_id;
                    if (bui_id === '未选择宿舍' || dor_id === '未选择宿舍') {
                        // 若没有宿舍则 为选择宿舍操作，获取楼栋名和宿舍号，获取被选宿舍最新人数
                        // 获取当前  楼栋名 寝室号
                        bui_id = $($(that).parent().siblings()[0]).html();
                        dor_id = $($(that).parent().siblings()[1]).html();
                    }
                    //更新当前宿舍信息
                    $.get(WWW + '/get_dor_info', {
                        dor_id,
                        bui_id
                    }, function(result) {
                        if (result.state === 1) {
                            max_num = result.data.max_num;
                            cur_num = result.data.cur_num;
                            // 全部数据更新完成 执行下一步操作
                            callback();
                        } else {
                            console.log("当前宿舍信息更新失败");
                            layer.msg("网络异常，请稍后再试 ", {
                                time: 1000,
                                icon: 5
                            });
                        }
                    });
                } else if (result.state === 0) {
                    console.log('用户数据更新失败，null');
                    layer.msg("网络异常，请稍后再试 ", {
                        time: 1000,
                        icon: 5
                    });
                }
            },
            error: function() {
                console.log('数据更新失败，null');
                layer.msg("网络异常，请稍后再试 ", {
                    time: 1000,
                    icon: 5
                });
            }
        });
    }
    // 更新用户和宿舍信息并获取配置信息
    function __init() {
        console.log('更新宿舍信息！');
        $('#choice_dor').removeClass('current');
        $('#dor_info').removeClass('current');
        dor_id = '未选择宿舍';
        bui_id = '未选择宿舍';
        $.ajax({
            url: WWW + '/get_user_info',
            method: 'get',
            success: (result) => {
                if (result.state === 1) {
                    sno = result.data.sno;
                    userName = result.data.name;
                    password = result.data.password;
                    sex = result.data.sex;
                    dor_id = result.data.dor_id;
                    bui_id = result.data.bui_id;
                    $('.name').html(userName);
                    if (dor_id === '未选择宿舍' || bui_id === '未选择宿舍') {
                        // 没有宿舍
                        $('#choice_dor').addClass('current');
                    } else {
                        // 有宿舍，展示宿舍信息
                        $.get(WWW + '/get_dor_info', {
                            dor_id,
                            bui_id
                        }, function(result) {
                            if (result.state === 1) {
                                max_num = result.data.max_num;
                                cur_num = result.data.cur_num;
                                $('#dor_id').html(dor_id);
                                $('#bui_id').html(bui_id);
                                $('#max_num').html(max_num);
                                $('#cur_num').html(cur_num);
                                $('#dif_num').html(max_num - cur_num);
                                $('#dor_sex').html(result.data.dor_sex);
                                // 添加退出宿舍按钮点击事件
                                $('#exit_dor').click('click', exit_dor);

                                // 获取室友信息
                                $.get(WWW + '/get_roommate', {
                                    dor_id,
                                    bui_id
                                }, function(result) {
                                    if (result.state === 1) {
                                        $('#roommate_cord').addClass('current');
                                        // 添加室友信息
                                        let r_li = '';
                                        for (var i = 0; i < max_num; i++) {
                                            if (i < result.data.length) {
                                                r_li += `<li class="layui-col-md4">
                                                        <a href="javascript:;">成员${i+1}<p>${result.data[i].name}</p></a>
                                                    </li>`;
                                            } else {
                                                r_li += `<li class="layui-col-md4">
                                                        <a href="javascript:;">成员${i+1}<p>暂无</p></a>
                                                    </li>`;
                                            }

                                        }
                                        $('#roommate_ul').html(r_li);
                                    } else {
                                        console.log('获取室友信息失败，null');
                                        layer.msg("获取室友息失败 ", {
                                            time: 1200,
                                            icon: 5
                                        });
                                    }
                                })
                                $('#dor_info').addClass('current');
                            } else {
                                console.log('获取宿舍信息失败，null');
                                layer.msg("获取宿舍信息失败，请联系管理员 ", {
                                    time: 1200,
                                    icon: 5
                                }, () => {
                                    $('#exit').click();
                                });
                            }
                        })
                    }

                } else if (result.state === 0) {
                    console.log('获取用户信息失败，null');
                    layer.msg("获取用户信息失败 ", {
                        time: 1000,
                        icon: 5
                    }, () => {
                        $('#exit').click();
                    });
                }
            },
            error: (err) => {
                console.log('获取用户信息出错，err');
                layer.msg("获取用户信息出错 ", {
                    time: 1000,
                    icon: 5
                }, () => {
                    $('#exit').click();
                });
            }
        });
    }
    __init();
    //侧边栏切换
    let body_div = $('.layui-body').children();
    layui.element.on('nav(side)', function(elem) {
        for (let i = 0; i < body_div.length; i++) {
            $(body_div[i]).removeClass('current');
        };
        let index = elem.context.innerText;
        if (index === '我的宿舍') {
            $(body_div[0]).addClass('current');
            __init();
            return;
        }
        if (index === '宿舍列表') {
            $(body_div[1]).addClass('current');
            getDormitory();
            return;
        }
        if (index === '我提交的申请') {
            $(body_div[2]).addClass('current');
            getApply();
        }
    });

    // logo 切换 欢迎界面
    let $logo_li = $('.logo_li');
    $logo_li.click('click', () => {
        for (let i = 0; i < body_div.length; i++) {
            $(body_div[i]).removeClass('current');
        };
        $(body_div[0]).addClass('current');
        __init();
    });


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
                            <td>${result.data[i].dor_sex}</td>`;
                    // 宿舍上限，不允许选择
                    if (result.data[i].cur_num === result.data[i].max_num) {
                        dorHtml += `<td>
                                        <button class="layui-btn layui-btn-disabled">满员</button>
                                        <button class="layui-btn layui-btn-disabled">申请</button>
                                </tr>`;
                    } else {
                        dorHtml += `<td>
                                        <button class="layui-btn layui-btn-normal">选择</button>
                                        <button class="layui-btn layui-btn-warm">申请</button>
                                    </td>
                                </tr>`;
                    }
                }
                $('#dor_list').html(dorHtml);
                $('#bui_sel').children()[0].selected = "selected";
                $('#sex_sel').children()[0].selected = "selected";
                $('#flag_sel').children()[0].selected = "selected";
                layui.form.render('select');
            } else if (result.state === 0) {
                layer.msg("获取宿舍列表失败", {
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
            data: { sno },
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
                                                <button class="layui-btn layui-btn-danger">撤销申请</button></td>
                                        </tr>`;
                        } else {
                            applyHtml += `  <td>
                                                <button class="layui-btn layui-btn-disabled">管理员已处理</button></td>
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




    // 利用事件委托，对所有选择按钮添加单击事件
    $('#dor_list').on('click', '.layui-btn-normal', function() {
        console.log(sno, bui_id, dor_id, cur_num, sex);
        // alert(1);
        isFreeChoice().then(value => {
            if (value) {
                //选择宿舍操作
                //判断用户当前是否有宿舍
                if (dor_id === '未选择宿舍' || bui_id === '未选择宿舍') {
                    // 更新数据
                    updateDate(() => {
                        // 发起选择宿舍请求
                        $.ajax({
                            url: WWW + '/choice_dor',
                            method: 'post',
                            data: {
                                sno,
                                bui_id,
                                dor_id,
                                cur_num,
                                sex
                            },
                            success: (result) => {
                                if (result.state === 1) {
                                    // 选择成功
                                    layer.msg("选择成功", {
                                        time: 1000,
                                        icon: 6
                                    }, function() {
                                        location.assign(WWW + '/student');
                                    });
                                    return;
                                } else if (result.state === 0) {
                                    //宿舍满了
                                    layer.msg("该宿舍已满，请选择其他宿舍", {
                                        time: 1200,
                                        icon: 5
                                    }, getDormitory());
                                } else if (result.state === -1) {
                                    // 选择出错
                                    layer.msg("选择失败，请稍后再试", {
                                        time: 1000,
                                        icon: 5
                                    }, getDormitory());
                                } else if (result.state === -2) {
                                    // 选择出错
                                    layer.msg("不可以搬入异性寝室", {
                                        time: 1000,
                                        icon: 5
                                    }, getDormitory());
                                }
                                dor_id = bui_id = '未选择宿舍';
                            },
                            error: (err) => {
                                // 请求发送出错
                                layer.msg("请求异常，请稍后再试", {
                                    time: 1000,
                                    icon: 5
                                })
                            }
                        });
                    }, this);
                } else {
                    // 已有宿舍，不可选择宿舍
                    layer.msg("已有宿舍，请先退出后再选择其他宿舍", {
                        time: 1200,
                        icon: 5
                    });
                }
            } else {
                layer.msg("管理员未开启自由选择宿舍权限，无法自主选择宿舍", {
                    time: 2000,
                    icon: 5
                });
            }
        })
    });
    // 利用事件委托，对所有申请按钮添加单击事件
    $('#dor_list').on('click', '.layui-btn-warm', function() {
        let dor_sex = $(this).parent().siblings()[4].innerText;
        if (dor_sex === sex) {
            let bui_id = $(this).parent().siblings()[0].innerText;
            let dor_id = $(this).parent().siblings()[1].innerText;
            $.ajax({
                url: WWW + '/addApply',
                method: 'post',
                data: {
                    sno,
                    name: userName,
                    bui_id,
                    dor_id
                },
                success: (result) => {
                    if (result.state === 1) {
                        layer.msg("申请成功，请耐心等待管理员处理", {
                            time: 1200,
                            icon: 6
                        })
                    } else if (result.state === -1) {
                        layer.msg("已经提交过申请了，请先撤销当前申请或管理员处理完当前申请后再提交", {
                            time: 2000,
                            icon: 5
                        })
                    } else {
                        // 数据库插入数据失败
                        layer.msg("申请失败，请稍后再试", {
                            time: 1200,
                            icon: 5
                        })
                    }
                },
                error: (err) => {
                    // 请求发送出错
                    layer.msg("申请失败，请稍后再试", {
                        time: 1000,
                        icon: 5
                    })
                }
            })
        } else {
            layer.msg("不可申请异性宿舍", {
                time: 1000,
                icon: 5
            });
        }

    });
    // 利用事件委托，对所有撤销申请按钮添加单击事件
    $('#apply_list').on('click', '.layui-btn-danger', function() {
        let postBody = {}
        postBody.sno = $(this).parent().siblings()[0].innerText;
        postBody.name = $(this).parent().siblings()[1].innerText;
        postBody.dor_id = $(this).parent().siblings()[2].innerText;
        postBody.bui_id = $(this).parent().siblings()[3].innerText;
        postBody.date = $(this).parent().siblings()[4].innerText;
        postBody.state = $(this).parent().siblings()[5].innerText;
        postBody.info = $(this).parent().siblings()[6].innerText;
        $.ajax({
            url: WWW + '/removeApply',
            method: 'post',
            data: postBody,
            success: (res) => {
                if (res.state === 1) {
                    layer.msg("撤销成功", {
                        time: 1000,
                        icon: 6
                    }, getApply());
                } else {
                    // 数据库出错
                    layer.msg("撤销失败", {
                        time: 1000,
                        icon: 5
                    })
                }
            },
            // 请求出错
            error: (err) => {
                layer.msg("撤销失败", {
                    time: 1000,
                    icon: 5
                })
            }
        });


    });
    //退出宿舍
    function exit_dor() {
        isFreeChoice().then(value => {
            if (value) {
                updateDate(() => {
                    // 发请求
                    //将当前用户的宿舍信息调为 未选择宿舍（sno），将之前宿舍的入住人数减一（cur_num,bui_id,dor_id）
                    cur_num = cur_num - 1;
                    $.get(WWW + '/exit_dor', {
                        sno,
                        cur_num,
                        bui_id,
                        dor_id
                    }, function(result) {
                        if (result.state === 1) {
                            layer.msg("退出宿舍成功", {
                                time: 1000,
                                icon: 6
                            }, function() {
                                __init();
                            });
                        } else {
                            layer.msg("退出宿舍失败，请联系管理员", {
                                time: 1000,
                                icon: 5
                            });
                        }
                    });
                });
            } else {
                layer.msg("管理员未开启自由选择宿舍权限，无法退出宿舍，请先去提交换宿舍的申请吧", {
                    time: 2000,
                    icon: 5
                });
            }
        })
    }
    // 修改个人信息
    let $edit = $('#edit');
    $edit.one('click', () => {
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
                    layer.msg("修改个人信息成功，请重新登录 ", {
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
    let $exit = $('#exit');
    $exit.one('click', () => {
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