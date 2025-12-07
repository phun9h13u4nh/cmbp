function transfer_data(data) {
    $.post("../assets/inc/firebase/transfer_data.php", { data: data })
        .done(function (data) {
        });
}
function firebase_custom(ref, data) {
    FireBaseApp.child(ref).set(data);
}
function decyprt(encrypted_json_string, passphrase = '123456') {
    var obj_json = encrypted_json_string;

    var encrypted = obj_json.ciphertext;
    var salt = CryptoJS.enc.Hex.parse(obj_json.salt);
    var iv = CryptoJS.enc.Hex.parse(obj_json.iv);

    var key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
function shuffleObject(obj) {
    // new obj to return
    let newObj = {};
    // create keys array
    var keys = Object.keys(obj);
    // randomize keys array
    keys.sort(function (a, b) { return Math.random() - 0.5; });
    // save in new array
    keys.forEach(function (k) {
        newObj[k] = obj[k];
    });
    return newObj;
}
function strip_tag(text) {
    return text.replace(/(<([^>]+)>)/gi, "");
}
function detect_url(text) {
    text = text.toString();
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a target='_blank' class='link' href='$1'>$1</a>");
}

function detect_emoji(text) {
    if (text.indexOf('<emo>') !== -1) {
        var explode = text.split('<emo>');
        $.each(explode, function (k, v) {
            if (v != '') {
                if (v.indexOf('</emo>') !== -1) {
                    v = v.split("</emo>");
                    v = v[0];
                    var data = v.split("_");
                    var sign = data[0];
                    var num = data[1];
                    if (getSafe(() => server_data.emoji.data[sign][num], 0) != 0) {
                        var replace_html = `<img alt='' class='emoji' src='assets/img/emoji/data/${sign}/${server_data.emoji.data[sign][num]}'>`;
                        text = text.replace("<emo>" + v + "</emo>", replace_html);
                    }
                }
            }
        });
    }
    if (text.indexOf('<voice>') !== -1) {
        var explode = text.split('<voice>');
        $.each(explode, function (k, v) {
            if (v != '') {
                if (v.indexOf('</voice>') !== -1) {
                    v = v.split("</voice>");
                    v = v[0];
                    var replace_html = `
                        <div class="audio_play">
                            <a class="recording_action" onclick="voice_play(this);">
                                <div class="icon_status">
                                    <img src="/assets/img/icon/mic_play.png">
                                </div>
                                <div class="status">
                                    <p>Phát</p>
                                </div>
                                <audio style="display:none" src="/assets/tmp/chat_audio/${v}.mp3"></audio>
                            </a>
                        </div>
                    `;
                    text = text.replace("<voice>" + v + "</voice>", replace_html);
                }
            }
        });
    }
    if (text.indexOf('<image>') !== -1) {
        var explode = text.split('<image>');
        $.each(explode, function (k, v) {
            if (v != '') {
                if (v.indexOf('</image>') !== -1) {
                    v = v.split("</image>");
                    v = v[0];
                    var replace_html = `
                        <div class="chat_image">
                            <img onclick="popup_data={'url':'/assets/tmp/chat_image/${v}'};popup_load('system/img_url')" src="/assets/tmp/chat_image/${v}">
                        </div>
                    `;
                    text = text.replace("<image>" + v + "</image>", replace_html);
                }
            }
        });
    }
    return text;
}
function getSafe(fn, defaultVal = '') {
    try {
        return_value = fn();
        if (typeof (return_value) == 'undefined') {
            return_value = defaultVal;
        }
        return return_value;
    } catch (e) {
        return defaultVal;
    }
}
function re_price(num) {
    num = num.replace(/[^0-9]+/g, "");
    return parseInt(num);
}
function time_format(time_send, revert = 'no', time_stamp = 'no') {
    if (time_stamp == 'no') {
        var my_date = time_send;
        my_date = my_date.replace(/-/g, "/");
        var d = new Date(my_date);
        var d_time = Math.floor(d.getTime() / 1000);
    } else {
        var d_time = time_send;
    }

    if (revert == 'no') {
        var time = server_time - d_time;
        var time_text = language_text('text_time_ago');
    } else {
        var time = d_time - server_time;
        var time_text = language_text('text_time_continue');
    }
    if (time >= 86400*30 || time <= -86400*30) {
        var dateObj = new Date(d_time * 1000);
        var string = ("0" + dateObj.getDate()).slice(-2) + "-" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" + dateObj.getFullYear();
    } else {
        if (time <= 60) {
            string = language_text('text_few_second') + " " + time_text;
        } else if (time > 60 && time <= (60 * 60)) {
            time_distance = Math.floor(time / 60);
            string = `${time_distance} ${language_text('text_time_minute')} ${time_text}`;
        } else if (time > (60 * 60) && time <= (60 * 60 * 24)) {
            time_distance = Math.floor(time / 60 / 60);
            string = `${time_distance} ${language_text('text_time_hour')} ${time_text}`;
        } else if (time > (60 * 60 * 24)) {
            time_distance = Math.floor(time / 60 / 60 / 24);
            string = `${time_distance} ${language_text('text_time_day')} ${time_text}`;
        } else {
            string = language_text('text_not_update');
        }
    }
    return (string);
}
function time_convert(time_send) {
    var return_time = time_send;
    return_time = return_time.replace(/-/g, "/");
    return_time = new Date(return_time);
    return_time = Math.floor(return_time.getTime() / 1000);
    var current_zone_time = new Date();
    current_zone_time = Math.floor(current_zone_time.getTime() / 1000);
    var target_zone_time = new Date();
    target_zone_time = target_zone_time.toLocaleString('en-US', { timeZone: "Asia/Ho_Chi_Minh" });
    target_zone_time = new Date(target_zone_time);
    target_zone_time = Math.floor(target_zone_time.getTime() / 1000);
    var diffirent_time = current_zone_time - target_zone_time;
    return return_time + diffirent_time;
}
function time_count_down(time_end) {
    if (time_end > server_time) {
        time = time_end - server_time;
        day = Math.floor(time / 60 / 60 / 24);
        hour = Math.floor((time - (day * 24 * 60 * 60)) / 60 / 60);
        min = Math.floor((time - (day * 24 * 60 * 60) - (hour * 60 * 60)) / 60);
        sec = Math.floor((time - (day * 24 * 60 * 60) - (hour * 60 * 60) - (min * 60)));
        if (day >= 1) {
            hour = hour + (day * 24);
        }
        if (hour < 10) {
            var hour_text = "0" + hour;
        } else {
            var hour_text = hour;
        }
        if (hour <= 0) {
            var hour_text = "";
        } else {
            var hour_text = hour_text + ":";
        }
        if (min < 10) {
            min = "0" + min;
        }
        if (sec < 10) {
            sec = "0" + sec;
        }
        string = hour_text + min + ":" + sec;
    } else {
        string = "00:00";
    }
    return string;
}
function get_time_count_down() {
    $('.time_count_down').each(function () {
        var time_end = $(this).attr('time');
        var result = time_count_down(time_end);
        if (result == '00:00') {
            if ($(this).attr('text_replace')) {
                result = $(this).attr('text_replace');
            } else {
                $(this).hide();
            }
            if ($(this).attr('end')) {
                window[$(this).attr('end')]();
            }
        } else {
            $(this).show();
        }
        $(this).text(result);
    });
    if (count_down_second >= 1) {
        count_down_second = count_down_second - 1;
        var string = '';
        if (count_down_second > 60) {
            var minutes = Math.floor(count_down_second / 60);
            var second = count_down_second % 60;
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (second < 10) {
                second = "0" + second;
            }
            string = minutes + ":" + second;
        } else {
            if (count_down_second < 10) {
                string = "00:0" + count_down_second;
            } else {
                string = "00:" + count_down_second;
            }
        }
        $("#count_down_div").text(string);
        $("#count_down_div").show();
    } else {
        $("#count_down_div").hide();
    }
}
function get_time_format() {
    $('.time_format').each(function () {
        var time_send = $(this).attr('time');
        if ($(this).attr('revert')) {
            var revert = $(this).attr('revert');
        } else {
            var revert = 'no';
        }
        if ($(this).attr('time_stamp')) {
            var time_stamp = $(this).attr('time_stamp');
        } else {
            var time_stamp = 'no';
        }
        $(this).text(time_format(time_send, revert, time_stamp));
    });
}
function import_user_ads() {
    var premium_level = getSafe(() => my_profile.info.premium.level, 0);
    if (premium_level == 0) {
        $('.pr_module.import_ads').each(function () {
            if($(this).html() == ''){
                $(this).html(`<div class="loading"></div>`);
                get_user_ads($(this));
            }
        });
    }
}
function time_to_date(time) {
    var date = new Date(time * 1000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + "-" + month + "-" + day;
}
function number_format(num) {
    num = num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num;
}
function copy_clipboard(e) {
    var string = $(e).attr('text');
    function handler(event) {
        event.clipboardData.setData('text/plain', string);
        event.preventDefault();
        document.removeEventListener('copy', handler, true);
    }
    document.addEventListener('copy', handler, true);
    document.execCommand('copy');
    alertify.success('Đã copy');
}
function load_module(target, module, scroll = 'yes', reload_page = 'yes') {
    if (module != 'game/data/character' && module != 'game/data/pet' && module != 'game/data/friend') {
        current_page = module;
    }
    if (reload_page == 'yes') {
        page = 1;
    }
    if (scroll == 'yes') {
        window.scrollTo(0, 0);
    }
    setTimeout(() => {
        $.post("../assets/inc/module/" + module + ".php", {})
            .done(function (data) {
                $('#' + target).empty().append(data);
            });
    }, 100);
}
function frame_load(frame) {
    $.post("../assets/inc/frame/" + frame + ".php", {})
        .done(function (data) {
            $('#frame_content').empty().append(data);
            $('.frame_content').fadeIn(300);
        });
}
function frame_close(frame) {
    $('.frame_content').fadeOut(300);
}
function popup_load(popup, reset = "no") {
    $.post("../assets/inc/popup/" + popup + ".php", {})
        .done(function (data) {
            $('#popup_content').append("<div class='popup_content'>" + data + "</div>");
            setTimeout(() => {
                $('.popup_content').show();
                if (reset == "yes") {
                    if ($('body').width() <= 799) {
                        window.scrollTo(0, 0);
                    }
                }
            }, 200)
        });
}
function popup_close(frame) {
    $('.popup_content').hide();
    $('.popup_content').removeClass('not_fixed');
    $('#popup_content').empty();
}
function clear_time_out(json = '') {
    for (var i = 0; i < json.length; i++) {
        clearTimeout(json[i]);
    }
}
function clear_interval(json) {
    for (var i = 0; i < json.length; i++) {
        clearInterval(json[i]);
    }
}
function clean_string(string) {
    var new_string = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/ /g, "-").toLowerCase().replace(/[^a-zA-Z0-9-]/g, '');
    return new_string;
}
function to_int(string) {
    return parseFloat(string, 10);
}
function step_amount_change(e,min,max,step){
    var next_amount = parseInt($(e).parent().children('input').val())+step;
    if(next_amount >= min && next_amount <= max){
        $(e).parent().children('input').val(next_amount);
    }
}
function setCookie(name, value, hours = 8760) {
    var expires = "";
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function cookie_login(username, password) {
    $.post("/assets/ajax/user.php", { action: "login", username: username, password: password })
        .done(function (data) {
            $('#result').empty().append(data);
        });
}
function logout() {
    localStorage.clear();
    $.post("/assets/ajax/user.php", { action: 'logout' })
        .done(function (data) {
            $('#result').empty().append(data);
        });
}
function update_online() {
    $.post("/assets/ajax/user.php", { action: "update_online" })
        .done(function (data) {
            $('#result').empty().append(data);
        });
}
function number_fix(number, decimal = 2) {
    number = Math.floor(number * Math.pow(10, decimal)) / Math.pow(10, decimal);
    return number;
}
function json_convert(str) {
    if (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return str;
        }
        return JSON.parse(str);
    } else {
        return {};
    }
}

function get_json_data(target, value) {
    if (!json_data[target]) {
        return new Promise(callback => {
            $.get("/assets/json/" + value + ".json?v=" + version, {})
                .done(function (data) {
                    json_data[target] = data;
                    callback(data);
                }).fail(function () {
                    callback({});
                });
        });
    } else {
        return json_data[target];
    }
}


function get_server_data(target) {
    if (!server_data[target]) {
        return new Promise(callback => {
            $.get("api/data?data=" + target, {})
                .done(function (data) {
                    server_data[target] = data;
                    callback(data);
                }).fail(function () {
                    callback({});
                });
        });
    } else {
        return server_data[target];
    }
}
function get_data_by_url(url) {
    return new Promise(callback => {
        $.get(url, {})
            .done(function (data) {
                if (data != "" || data == 0) {
                    callback(data)
                } else {
                    callback({});
                }
            }).fail(function () {
                callback({});
            });;
    });
}

function get_character_list(url) {
    return new Promise(callback => {
        $.get(url, {})
            .done(function (data) {
                if (data != "") {
                    var list_data = {}
                    $.each(data, function (index, value) {
                        if(value.amount_lock && value.data){
                            list_data[value.sign] = {};
                            list_data[value.sign].amount = value.data;
                            list_data[value.sign].amount_lock = value.amount_lock;
                        }else{
                            list_data[value.sign] = json_convert(value.data);
                            if (value.cp) {
                                list_data[value.sign].cp = value.cp;
                            }
                        }
                    });
                    callback(list_data)
                } else {
                    callback({});
                }
            }).fail(function () {
                callback({});
            });;
    });
}

function quality_convert(quality, type = "equipment") {
    var num = Math.floor((quality - 0.65) / 0.15);
    num = num < 1 ? 1 : num;
    var data = {};
    data.num = num;
    data.name = json_data.language[type + '_quality_' + num];
    return data;
}

function get_skill_detail(sign, level, strong, rare) {
    var skill_type = json_data.skill.profile[sign].sign;
    var skill = json_data.skill.data[skill_type];
    var skill_rare = { 1: 0, 2: 25, 3: 60, 4: 105, 5: 160 }
    var skill_value = Math.floor(skill.value * (1 + (level * 0.05 + strong * 0.1 + (skill_rare[rare] / 100))))
    var text = "";
    if (skill.special) {
        if (skill.special.sign == "true_damage") {
            text = language_text('text_skill_detail_true_dmg', [skill_value, skill.area]);
        } else if (skill.special.sign == "damage_convert") {
            text = language_text('text_skill_detail_dmg_convert', [skill_value, skill.area, skill.special.value]);
        }
    } else if (skill.target == "enemy" && skill.value != 0) {
        text = language_text('text_skill_detail_dmg', [skill_value, skill.area]);
        if (skill.effect) {
            if (skill.effect[1].sign == "hpRestoreReduce") {
                text = text + language_text('text_skill_detail_hpRestoreReduce', [skill.effect[1].turn]);
            }
        }
    } else if (skill.target == "team" && skill.value != 0) {
        text = language_text('text_skill_detail_hpRestore', [skill.area, skill_value]);
    } else if (skill.target == "self" && skill.value == 0) {
        skill_effect_value = Math.floor(skill.effect[1].value * (1 + (level * 0.05 + strong * 0.1 + (rare - 1) * 0.25)))
        if (skill.effect[1].sign == "defend") {
            text = language_text('text_skill_detail_defend', [skill_effect_value, skill.effect[1].turn]);
        } else if (skill.effect[1].sign == "avoid") {
            text = language_text('text_skill_detail_avoid', [skill_effect_value, skill.effect[1].turn]);
        } else if (skill.effect[1].sign == "damageReturn") {
            text = language_text('text_skill_detail_damageReturn', [skill_effect_value, skill.effect[1].turn]);
        }
    } else if (skill.value == 0) {
        if (skill.effect) {
            skill_effect_value = Math.floor(skill.effect[1].value * (1 + (level * 0.05 + strong * 0.1 + (rare - 1) * 0.25)))
            if (skill.effect[1].sign == "defend") {
                text = language_text('text_skill_detail_defend_2', [skill_effect_value, skill.area, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "attack") {
                text = language_text('text_skill_detail_attack', [skill_effect_value, skill.area, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "weaken") {
                text = language_text('text_skill_detail_weaken', [skill_effect_value, skill.area, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "curse") {
                text = language_text('text_skill_detail_curse', [skill.area, skill_effect_value, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "silent" && skill.effect[2]) {
                if (skill.effect[2].sign == "disarm") {
                    text = language_text('text_skill_detail_silent_disarm', [skill.area, skill.effect[1].turn]);
                }
            } else if (skill.effect[1].sign == "silent") {
                text = language_text('text_skill_detail_silent', [skill.area, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "disarm" && skill.effect[2]) {
                if (skill.effect[2].sign == "hpRestoreReduce") {
                    text = language_text('text_skill_detail_disarm_hpRestoreReduce', [skill.area, skill.effect[1].turn, skill.effect[2].turn]);
                } else if (skill.effect[2].sign == "mpStop") {
                    text = language_text('text_skill_detail_disarm_mpStop', [skill.area, skill.effect[1].turn]);
                } else if (skill.effect[2].sign == "silent") {
                    text = language_text('text_skill_detail_disarm_silent', [skill.area, skill.effect[1].turn]);
                }
            } else if (skill.effect[1].sign == "disarm") {
                text = language_text('text_skill_detail_disarm', [skill.area, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "mpBuff") {
                text = language_text('text_skill_detail_mpBuff', [skill.area, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "mpStop") {
                text = language_text('text_skill_detail_mpStop', [skill.area, skill.effect[1].turn]);
            } else if (skill.effect[1].sign == "antiEffect") {
                if (skill.target == "team") {
                    text = language_text('text_skill_detail_antiEffect_team', [skill.area, skill.effect[1].turn]);
                } else {
                    text = language_text('text_skill_detail_antiEffect_enemy', [skill.area, skill.effect[1].turn]);
                }
            }
        }
    }
    return text;
}

function equipment_stats_render(data,view_special = "no") {
    var percent_stats = ["critical", "critical_damage", "avoid", "skill_atk", "skill_def"];
    var html = '';
    $.each(data, function (k, v) {
        if(view_special == "source"){
            var value = v.main;
        }else{
            var value = percent_stats.includes(k) ? v.total + "%" : v.total;
        }
        html += `
            <div class="item">
                <p class="label">${json_data.language['stats_' + k]}</p>
                <p class="value">${value}</p>
            </div>
        `;
    });
    return html;
}

function get_account_secret(account, target) {
    return new Promise(callback => {
        $.post("/assets/ajax/" + target + ".php", { action: 'get_account_secret', account_id: account })
            .done(function (data) {
                callback(JSON.parse(data));
            });
    });
}

function get_gift(gift, target) {
    return new Promise(callback => {
        $.post("/assets/ajax/" + target + ".php", { action: 'get_gift', gift_id: gift })
            .done(function (data) {
                callback(JSON.parse(data));
            });
    });
}

function removeAccents(str) {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}
function album_tags_search(e, target) {
    var string = $(e).val();
    if (string != "" || target == 2) {
        $(e).parent('.tags_module').children('.tags_create').children('.tags_span').each(function (index) {
            if (removeAccents($(this).text()).indexOf(removeAccents(string)) != -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        $(e).parent('.tags_module').children('.tags_create').show();
        $(e).parent('.tags_module').children('.tags_icon_close').show();
        $(e).parent('.tags_module').children('.tags_create').children('.tags_generate').remove();
        $(e).parent('.tags_module').children('.tags_create').append(`<div class="tags_generate tags_span" onclick="tags_list_select(this)">${string}</div>`);
    } else {
        $(e).parent('.tags_module').children('.tags_create').hide();
        $(e).parent('.tags_module').children('.tags_icon_close').hide();
    }
}
function tags_list_create(e) {
    var text = $(e).val();
    if (text != "") {
        $(e).parent('.tags_module').children('.tags_create').html(`<div onclick="tags_list_select(this)" class="tags_span">${text}</div>`);
        $(e).parent('.tags_module').children('.tags_create').show();
    } else {
        $(e).parent('.tags_module').children('.tags_create').html('');
        $(e).parent('.tags_module').children('.tags_create').hide();
        $(e).parent('.tags_module').children('.tags_icon_close').hide();
    }
}
function tags_list_select(e) {
    var text = $(e).text();
    $(e).parent('.tags_create').parent('.tags_module').children('input').val('');
    $(e).parent('.tags_create').parent('.tags_module').children('.tags_create').hide();
    $(e).parent('.tags_create').parent('.tags_module').children('.tags_icon_close').hide();
    $(e).parent('.tags_create').parent('.tags_module').parent('.tags_list').children('.tags_show').append(`<div class="tags_span">${text}<div onclick="tags_list_remove(this)" class="close"><i class="far fa-times center_div"></i></div></div>`);
}
function tags_change_select(e) {
    var text = $(e).text();
    $(e).parent('.tags_create').parent('.tags_module').children('input').val(text);
    $(e).parent('.tags_create').parent('.tags_module').children('.tags_create').hide();
    $(e).parent('.tags_create').parent('.tags_module').children('.tags_icon_close').hide();
}
function tags_list_remove(e) {
    $(e).parent('.tags_span').remove();
}
function filter_select_touch(e) {
    if (e.classList.contains("active")) {
        e.classList.remove("active");
        $(e).parent().children('.hidden').slideUp();
    } else {
        e.classList.add("active");
        $(e).parent().children('.hidden').slideDown();
    }
}
function filter_select_change(e) {
    var target = e.getAttribute("target");
    var text = e.innerHTML;
    $(e).parent().parent().children('.show').html(text + " <i class='fas fa-caret-down'></i>");
    $(e).parent().parent().children('.show').attr("target", target);
    $(e).parent().slideUp();
    $(e).parent().parent().children('.show').removeClass("active");
}

function member_profile(user) {
    user_profile_id = user;
    popup_load('profile/user');
}

function change_step(num) {
    for (var i = 1; i <= 5; i++) {
        $('.step_' + i).addClass('hide_v')
    }
    $('.step_' + num).removeClass('hide_v');
}

function open_menu_hidden(e) {
    if ($(e).attr('target') == 'off') {
        $('.menu_hidden').slideUp(200);
        $('.menu_hidden').parent().find('.menu_open').attr('target', 'off');
        $(e).attr('target', 'on');
        $(e).parent().find('.menu_hidden').slideDown(200);
    } else {
        $(e).attr('target', 'off');
        $(e).parent().find('.menu_hidden').slideUp(200);
    }
}
function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}
function substr_utf8_bytes(str, startInBytes, lengthInBytes) {
    str = str.replace(/<\/?[^>]+>/gi, '');
    var resultStr = '';
    var startInChars = 0;
    for (bytePos = 0; bytePos < startInBytes; startInChars++) {
        ch = str.charCodeAt(startInChars);
        bytePos += (ch < 128) ? 1 : encode_utf8(str[startInChars]).length;
    }

    end = startInChars + lengthInBytes - 1;

    for (n = startInChars; startInChars <= end; n++) {
        ch = str.charCodeAt(n);
        end -= (ch < 128) ? 1 : encode_utf8(str[n]).length;

        resultStr += str[n];
    }

    return resultStr;
}

function containsURL(str) {
    var urlPattern = /(https?:\/\/[^\s]+)/g; // Regular expression to match URLs

    return urlPattern.test(str);
}

function user_frame_render(user_info,custom = "no") {
    if(custom == "no"){
        var frame = getSafe(() => user_info.fame.frame,'default');
    }else{
        frame = user_info;
    }
    console.log(frame);
    if (frame.indexOf('discord_') != -1) {
        return `<img src="assets/img/fame/frame/${frame}.png" class="discord"/>`;
    }else{
        return `<img src="assets/img/fame/frame/${frame}.png"/>`;
    }
}
function user_badge_render(user_info) {
    var html = `<div class='badge_list'>`;
    if (user_info.fame) {
        if (user_info.fame.badge) {
            $.each(user_info.fame.badge, function (sign, level) {
                html += `<img onclick="popup_data = {'sign':'${sign}','level':'${level}'};popup_load('profile/badge')" class='badge_item' src='assets/img/fame/badge/${sign}_${level}.png'>`;
            });
        }
    }
    return html + "</div>";
}

function render_preview_image(e, target) {
    if ($(e).val() != '') {
        var ext = $(e).val().split('.').pop().toLowerCase();
        if ($.inArray(ext, ['jpg', 'jpeg', 'png' , 'webp']) == -1) {
            alertify.error('Chỉ hỗ trợ định dạng JPG, JPEG, PNG , WEBP!');
            $(e).val('');
        } else {
            var files = e.files;
            for (var i = 0, f; f = files[i]; i++) {
                if (!f.type.match('image.*')) {
                    continue;
                }
                var reader = new FileReader();
                reader.onload = (function (theFile) {
                    return function (e) {
                        $(target).attr('src', e.target.result);
                    };
                })(f);
                reader.readAsDataURL(f);
            }
        }
    }
}

function text_random(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


function render_item_loading(num) {
    html = "";
    for (var i = 0; i < num; i++) {
        html = html + `
            <div class='item'>
                <div class="loading">
                    <img alt='' src="/assets/img/logo.png" />
                </div>
            </div>
        `;
    }
    return html + "<div class='clear'></div>";
}

function page_redirect_render(total, page, limit, target = "page") {
    if (total > limit) {
        var page_html = '';

        var num_page = Math.ceil(total / limit);
        if (page >= num_page) {
            page = num_page;
        }
        if (page <= 3) {
            if (num_page > 5) {
                z = 5;
            } else {
                z = num_page;
            }
            a = 1;
        } else {
            if ((num_page - page) >= 2) {
                a = page - 2;
                z = page + 2;
            } else if ((num_page - page) < 2 && num_page <= 5) {
                a = (num_page - num_page) + 1;
                z = num_page;
            } else {
                a = num_page - 5;
                z = num_page;
            }
        }
        for (i = a; i <= z; i++) {
            if (i == page) {
                page_html = page_html + `<a><p class="active">${i}</p></a>`;
            } else {
                page_html = page_html + `<a onclick="${target}=${i};page_redirect_start()"><p>${i}</p></a>`;
            }

        }
        return page_html;
    }
}

function number_convert(num) {
    if (num >= 1000000) {
        num = Math.round((num / 1000000) * 10) / 10;
        sign = "M";
    } else if (num >= 1000) {
        num = Math.round((num / 1000) * 10) / 10;
        sign = "K";
    } else {
        sign = "";
    }
    return num + sign;
}

function setupLazyLoading() {
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazyload"));
    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.original;
                    lazyImage.classList.remove("lazyload");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function (lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        lazyImages.forEach(function (lazyImage) {
            lazyImage.src = lazyImage.dataset.original;
            lazyImage.classList.remove("lazyload");
        });
    }
}
function waitingBackground(renderHtml, num) {
    var html = "";
    for (var i = 0; i < num; i++) {
        html += renderHtml;
    }
    return html;
}

async function balance_currency_html(type) {
    var currency_list = {};
    currency_list[type] = await get_data_by_url(`/api/character_count?character=${my_character}&type=currency&sign=${type}`);
    currency_html = ``;
    $.each(currency_list, function (currency, amount) {
        currency_html += `
            <div class="item">
                <img class="icon" src="/assets/img/level/currency/${currency}.png">
                <p class="num">${number_format(amount)}</p>
            </div>
        `;
    });
    return currency_html;
}

function chapterRender(data,score = "normal") {
    var html = '';
    var list_text_warning = ["boys' love", "girls' love", "18+", "adult", "ecchi", "harem", "đam mỹ", "bách hợp"];
    $.each(data, function (index, value) {
        var album_info = json_convert(value.info);
        var album_data = json_convert(value.data);
        if(album_info.name && album_info.url){
            album_info.name = album_info.name.replace(/\\/g, "");
            var text_warning = ``;
            $.each(list_text_warning, function (tags_index, tags_value) {
                if (album_info.tags.includes(tags_value)) {
                    text_warning = `· <span class="text_warning">${tags_value}</span>`;
                    return false;
                }
            });
            if (local_data.album_history[value.id_album]) {
                var history = local_data.album_history[value.id_album];
                var book_cotinue = `<span><i class="fas fa-map-marker-alt"></i></span> <a href='/album/${album_info.url}/chapter-${history.num}-${history.id}'><span> Đang đọc ${history.num}</a>`;
                var text_continue = `<div class="book_continue"><a class="no_hover" href="/album/${album_info.url}/chapter-${history.num}-${history.id}"><span>Đang đọc ${history.num}</span></a></div>`;
            } else {
                var book_cotinue = '';
                var text_continue = '';
            }
            var icon = "";
            if (parseInt(album_info.statics.view) / parseInt(album_info.chapter.last) > 100) {
                icon += "<img alt='' src='assets/img/icon/tags/hot.png'/>";
            }
            var team = getSafe (() => album_info.team, 0);
            if(team != 0){
                icon += "<img alt='' src='assets/img/icon/tags/unique.png'/>";
            }
            if(album_info.status == 'done'){
                icon += "<img alt='' src='assets/img/icon/tags/done.png'/>";
            }
            if (album_info.chapter.id != 0) {
                var last_chapter = `<a href="/album/${album_info.url}/chapter-${album_info.chapter.last}-${album_info.chapter.id}" title="${album_info.name} chapter ${album_info.chapter.last}" itemprop="url">Chapter <span itemprop="issueNumber">${album_info.chapter.last}</span></a> ${text_warning}`;
            } else {
                var last_chapter = `Chưa có`;
            }
            if(score == "normal"){
                var score_text = `<p class="time_format" time="${value.last_update}"></p>`;
            }else{
                var score_num = getSafe(() => eval(score), 0);
                var score_text = `<p class="score">${number_format(score_num)}</p>`;
            }
            html += `
                <li class="swiper-slide" itemscope itemtype="https://schema.org/ComicSeries">
                    <div class="book_avatar" itemtype="https://schema.org/ImageObject">
                        ${text_continue}
                        <div class="book_tags">${icon}</div>
                        <a href="/album/${album_info.url}-${value.id_album}"><img onerror="$(this).attr('src','/assets/img/transparent.png');" src="/assets/img/transparent.png" data-original="/assets/tmp/album/${album_info.avatar}" alt="${album_info.name}" class="lazyload avatar" itemprop="image"/></a>
                        <div class="book_detail"><span><i class="fas fa-eye"></i> ${number_convert(album_info.statics.view)}</span><span><i class="fas fa-bookmark"></i> ${number_convert(album_info.statics.follow)}</span></div>
                        <p itemprop="description" style="display: none;">${album_info.detail}</p>
                    </div>
                    <div class="book_info">
                        <div class="book_name" itemprop="name">${icon}  <a title="${album_info.name}" href="/album/${album_info.url}-${album_info.id}">${album_info.name}</a></div>
                        <div class="text_detail">
                            <p class="text_continue">${book_cotinue}</p>
                            <p class="text_statics"><span><i class="fas fa-bookmark"></i> ${number_convert(album_info.statics.follow)}</span><span><i class="fas fa-eye"></i> ${number_convert(album_info.statics.view)}</span> <img src='assets/img/icon/album_file/${value.file}.png'/></p>
                        </div>
                        <div class="last_chapter">
                            <p itemprop="hasPart" itemscope itemtype="http://schema.org/ComicIssue">${last_chapter}</p>
                            ${score_text}
                        </div>
                        <div class="chapter_icon">
                            <i album='${value.id_album}' onclick="history_remove(this)" class="icon_remove fa-regular fa-trash"></i>
                        </div>
                    </div>
                </li>
            `;
        }
    });
    setTimeout(() => { setupLazyLoading() }, 200);
    return html;
}

function item_render(sign, type, amount) {
    return `
        <div onclick="popup_data = {'type':'${type}','sign':'${sign}'};popup_load('profile/item')" class="item">
            <img class="center_div" src="/assets/img/level/${type}/${sign}.png">
            <p class="amount">${number_format(number_fix(amount))}</p>
        </div>
    `;
}

function point_render(num, max = 5) {
    var html = "";
    for (var i = 0; i < num; i++) {
        html += `<li class="active"></li>`;
    }
    for (var i = 0; i < max - num; i++) {
        html += `<li></li>`;
    }
    return html;
}

function level_render(data) {
    var main_level = Math.floor(data.num / 10);
    var sub_level = data.num % 10;
    var text = json_data.language['character_level_' + main_level] + ' ' + json_data.language['character_mini_level_' + sub_level];
    var next_level = (main_level * 10) + sub_level + 1;
    var next_exp = server_data.game_exp.character[next_level];
    var bar_width = Math.floor(data.exp / next_exp * 100);
    return `<span class='num'>${text}</span><span class="exp">${number_format(data.exp)}/${number_format(next_exp)}</span><div class="bar" style="width:${bar_width}%"></div>`;
}

function setSetting(type, value) {
    var setting = getCookie('setting');
    if (setting == null) {
        setting = {};
    } else {
        setting = JSON.parse(setting);
    }
    setting[type] = value;
    setCookie('setting', JSON.stringify(setting));
}
function getSetting(name) {
    var setting = getCookie('setting');
    if (setting != null) {
        setting = JSON.parse(setting);
        return getSafe(() => setting[name], null);
    } else {
        return null;
    }
}
function character_profile(target, id) {
    popup_data = { 'target': target, 'id': id };
    popup_load('profile/character');
}

function comment_send(e) {
    var album_id = $(e).attr('album');
    var chapter_id = $(e).attr('chapter');
    var comment_id = $(e).attr('comment');
    var user_id = $(e).attr('user');
    var text = $(e).parent().children('.comment_text_value').val();
    $(e).parent().parent().children('.div_comment_list').show();
    if(text.indexOf('like') !== -1){
        alertify.error('Hành vi xin like không được phép. Cố tình vi phạm sẽ bị reset danh vọng');
    }else{
        if (text != '') {
            $(e).parent().children('.comment_text_value').val('');
            $.post("/assets/ajax/user.php", { action: 'comment', album_id: album_id, chapter_id: chapter_id, comment_id: comment_id, user_id: user_id, text: text })
                .done(function (data) {
                    $('#result').empty().append(data);
                });
        } else {
            alertify.error(language_text('text_comment_empty'));
        }
    }
}

async function comment_load(e) {
    var album = $(e).attr('album');
    var chapter = $(e).attr('chapter');
    var comment = $(e).attr('comment');
    var type = $(e).attr('type');
    var sort = type == "comment" ? $(e).attr('sort') : "new";
    var limit = type == "comment" ? 10 : 500;
    var comment_list = await get_data_by_url(`/api/comment_list?album=${album}&chapter=${chapter}&comment=${comment}&limit=${limit}&page=${page}&sort=${sort}`);
    var html = "";
    $.each(comment_list.data, function (index, data) {
        if (type == "reply") {
            html = comment_render(data, type) + html;
        } else {
            html += comment_render(data, type);
        }
    });
    $(`.comment_list_${album}_${chapter}_${comment}`).html(html);
    if (type == "comment") {
        $(`.comment_${album}_${chapter} .div_comment_list`).show();
        if (comment_list.total > 10) {
            $(`.comment_${album}_${chapter} .page_redirect`).html(page_redirect_render(comment_list.total, page, limit));
            $(`.comment_${album}_${chapter} .page_redirect`).show();
        }
    } else {
        $(`#comment_${comment} .comment_list_hidden`).show();
    }
    $(e).hide();

    $(".comment_reply .comment_text_value").off('keypress').keypress(function (e) {
        if (e.which == 13) {
            $(this).parent().children('svg').click();
        }
    });
}

function chapter_image_fix(e) {
    var src = $(e).attr('src');
    var load = parseInt($(e).attr('load'));

    if (load < 3) {
        setTimeout(() => {
            if (src.indexOf('/data-image/') !== -1) {
                $(e).attr('load', load + 1);
                var new_src = src.replace('?v=', '?v=' + load +server_time+ 'r');
                new_src = new_src.replace('img.cmangapi.com', window.location.hostname);
                $(e).attr('src', new_src);
                if(chapter_info.upload == 203){
                    image_error_list["dc1.mideman.com"]++;
                }
            }else if (src.indexOf('https://s3.mideman.com/') !== -1) {
                image_error_list["s3.mideman.com"]++;
                $(e).attr('load', 3);
                $(e).attr('src', `/data-image/index.php?link=${src}`);
            }else if(src.indexOf('https://dc1.mideman.com/') !== -1){
                image_error_list["dc1.mideman.com"]++;
                $(e).attr('load', 2);
                var new_src = src.replace('https://dc1.mideman.com/', "https://s3.mideman.com/file/mideman/");
                $(e).attr('src', new_src);
            }
        }, 1000);
    } else {
        $(e).attr('src', '/assets/img/image_error.png');
        $(e).css('width', 'auto');
    }
}

function chapter_load_page(){
    if ($('.chapter_non_load').length > 0) {
        var firstNonLoad = $('.chapter_non_load').first();
        firstNonLoad.attr('src', firstNonLoad.data('src')).on('load error', function() {
            chapter_load_page();
        });
        firstNonLoad.removeClass('chapter_non_load');
    }else{
        if(image_error_list["dc1.mideman.com"] > 0 && image_error_list["s3.mideman.com"] == 0){
            image_error_list["dc1.mideman.com"] = -99;
            $.post("/assets/ajax/user.php", { action: 'chapter_repair', chapter_id: chapter_id }, function (data) { chapter_image_render(1)});
        }
    }
}

function chapter_view(chapter_id) {
    $.post("/assets/ajax/user.php", { action: 'chapter_view', chapter_id: chapter_id }, function (data) { });
}

function addTargetToParagraphs(chapterId) {
    const chapterText = document.querySelector('.chapter_text_no_add');
    if (chapterText) {
        const paragraphs = chapterText.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
            p.setAttribute('page', index + 1);
            p.setAttribute('src', '/tool/image_line.php?line='+index+1);
            p.setAttribute('chapter', chapterId);
            p.classList.add('chapter_image'); 
        });
    }
    $('.chapter_text_no_add').removeClass('chapter_text_no_add');
}

function processChapterText(text) {
    const regex = /:split:([\s\S]*?):split_end:/g;
    var width = $('.chapter_content').width();
    var font_size = 15;
    var line_height = 26;
    var color = "#cccee3";
    var font_weight = 500;
    var font_family = 'Montserrat';
    var text_setting = getSetting('text_setting') ?? null;
    if(text_setting){
        font_size = text_setting.font_size;
        line_height = text_setting.line_height;
        color = text_setting.color;
        font_weight = text_setting.font_weight ?? 500;
        font_family = text_setting.font_family ?? 'Montserrat';
    }
    color = color.replace('#', '');
    return text.replace(regex, function(match, capturedText) {
        // Encode the text for URL
        const encodedText = encodeURIComponent(capturedText.trim());
        return `<img src="/data-image/text.php?text=${encodedText}&w=${width}&size=${font_size}&line_height=${line_height}&color=${color}&font_weight=${font_weight}&font_family=${font_family}" />`;
    });
}

async function chapter_image_render(version = 0) {
    image_error_list = {"dc1.mideman.com":0,"s3.mideman.com":0};
    $('.chapter_control').hide();
    $('.chapter_control .previous_chapter').hide();
    $('.chapter_control .next_chapter').hide();
    var get_data = await get_data_by_url(`/api/chapter_info?id=${chapter_id}&v=${version}`);
    chapter_info = json_convert(get_data);
    var chapter_name = chapter_info.name != "" ? "Chapter " + chapter_info.num +": " + chapter_info.name : "Chapter " + chapter_info.num;

    html = `        
        <h1>${album_info.name} - ${chapter_name}</h1>
    `;
    var user_load = "no";
    var chapter_level = getSafe(() => chapter_info.level, 0);
    var chapter_lock_end = getSafe(() => chapter_info.lock.end, 0);
    var chapter_lock_fee = getSafe(() => chapter_info.lock.fee, 0);
    if(chapter_level != 0 || chapter_lock_end >= server_time || token_permission != 7){
        var chapter_content = await get_data_by_url(`/api/chapter_image?chapter=${chapter_id}&v=${version}&time=${server_time}`);
    }else{
        var chapter_content = await get_data_by_url(`/api/chapter_image?chapter=${chapter_id}&v=${version}`);
    }
    if (chapter_content.status == 1) {
        $('body.chapter_page .fly_comment').show();
        if(chapter_lock_end < server_time || chapter_lock_fee == 0){
            setTimeout(() => {
                var premium_level = getSafe(() => my_profile.info.premium.level, 0);
                var ranking = getSafe(() => my_character_data.info.ranking, 601);
                var total_point = getSafe(() => my_profile.fame.point.total, 0);
                var ads_num = getCookie('ads_num') ?? 0;
                var my_team = getSafe(() => my_profile.info.team.id, 0);
                var team_id = getSafe(() => album_info.team, 0);
                if(premium_level == 0 && my_team == 0 && parseInt(ranking) > 500 && (parseInt(ads_num) >= 3 || team_id != 0)){
                    $(`#chapter_content_${chapter_id} .chapter_content`).css('opacity', '0');
                    $('.chapter_ad_block').removeClass('hide');
                    $('.fly_comment').hide();
                    popup_load('album/chapter/ads');
                    //(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('wugroansaghadry.com',8936628,document.createElement('script'));
                }else{
                    setCookie('ads_num', parseInt(ads_num) + 1);
                }
            }, 1000);
        }
        if(album_file == "image"){
            $.each(chapter_content.image, function (index, value) {
                alt = album_info.name + ' Chapter ' + chapter_info.num + ' Trang ' + index;
                html = html + `<img onerror="chapter_image_fix(this);" load="0" alt = '${alt}' class="chapter_image chapter_non_load" id="image_${chapter_id}_${index}" chapter = "${chapter_id}" page = "${index}" data-src="${value}" src="/assets/img/transparent.png"/>`;
            });
        }else if(album_file == "text"){
            var text = processChapterText(chapter_content.text);
            html = html + `<div class="chapter_text chapter_text_no_add">${chapter_text_to_html(text)}</div>`;
        }
    } else if (chapter_content.status == 0) {
        $('body.chapter_page .fly_comment').hide();
        var fame_level = getSafe(() => my_profile.fame.level, 0);
        html += `
                <div class="chapter_lock">
                    <img class="image" src="assets/img/sorry.gif">
        `;
        if (token_user == 0) {
            html += `<p class="title">Chapter này chỉ dành cho thành viên</p>`;
            html += `<p class="content">Hãy vui lòng đăng nhập</p>`;
        } else if (fame_level < chapter_content.level) {
            html += `<p class="title">Chapter này chỉ dành cho thành viên</p>`;
            html += `
                <p class="content">Bạn cần đạt cấp bậc <img class="item_icon" src="/assets/img/fame/badge/point_${chapter_content.level}.png"> <span>${json_data.language['fame_badge_point_' + chapter_content.level]}</span> (${number_format(server_data.user_fame.badge.point[chapter_content.level])} danh vọng) để xem chapter này</p>
                <button onclick="location.href='/user/user/fame/quest'" class="button_style_one">Làm nhiệm vụ ngay</button>
                <button onclick="popup_data={'target':'premium','currency':'manga_coin'};popup_load('user/premium');" class="button_style_one">Mua gói thành viên</button>
            `;
        } else if(chapter_content.lock){
            if(fame_level < chapter_content.lock.level){
                html += `<p class="title">Chapter này chỉ dành cho thành viên</p>`;
                html += `
                    <p class="content">Bạn cần đạt cấp bậc <img class="item_icon" src="/assets/img/fame/badge/point_${chapter_content.lock.level}.png"> <span>${json_data.language['fame_badge_point_' + chapter_content.lock.level]}</span> (${number_format(server_data.user_fame.badge.point[chapter_content.lock.level])} danh vọng) để xem chapter này</p>
                    <button onclick="location.href='/user/user/fame/quest'" class="button_style_one">Làm nhiệm vụ ngay</button>
                    <button onclick="popup_data={'target':'premium','currency':'manga_coin'};popup_load('user/premium');" class="button_style_one">Mua gói thành viên</button>
                    
                `;
            }else{
                html += `<p class="title">Chapter này đã bị khóa</p>`;
                html += `
                    <p class="content">Chapter này đã bị khóa với giá <span>${chapter_content.lock.fee}</span> <img class="item_icon" src="/assets/img/user/currency/manga_coin.png">. Hãy mở khóa để ủng hộ nhóm dịch nhé!</p>
                    <button onclick="chapter_unlock(this)" class="button_style_one">Mở khóa ngay</button>
                    <button onclick="popup_load('user/auto_unlock')" class="button_style_one">Tự động mở khóa</button>
                `;
            }
            if(chapter_content.lock.end - server_time < 86400*60){
                html += `<p class="end">Hoặc chờ mở khóa sau <span class="time_count_down" time="${chapter_content.lock.end}"></span></p>`;
            }
        }
        html += `</div>`;
    } else {
        html += `
            <div class="chapter_lock">
                <img class="image" src="assets/img/sorry.gif">
                <p class="title">Chapter này đã bị lỗi</p>
                <p class="content">Hãy giúp mình báo lỗi cho GM</p>
                <button onclick="popup_load('album/chapter/report')" class="button_style_one">Báo lỗi ngay</button>
            </div>
        `;
    }
    next_chapter = {
        'num': 999999,
        'id': 0
    };
    previous_chapter = {
        'num': 0,
        'id': 0
    };
    chapter_html = '';
    $.each(chapter_list, function (index, value) {
        var get_chapter_info = JSON.parse(value.info);
        if (value.id_chapter == chapter_id) {
            chapter_html = chapter_html + `<option chapter="${value.id_chapter}" value="${value.id_chapter}" selected>Chapter ${get_chapter_info.num}</option>`;
        } else {
            chapter_html = chapter_html + `<option chapter="${value.id_chapter}" value="${value.id_chapter}">Chapter ${get_chapter_info.num}</option>`;
        }
        if (to_int(get_chapter_info.num) < to_int(chapter_info.num) && to_int(get_chapter_info.num) > to_int(previous_chapter.num)) {
            previous_chapter.num = to_int(get_chapter_info.num);
            previous_chapter.id = value.id_chapter;
        } else if (to_int(get_chapter_info.num) > to_int(chapter_info.num) && to_int(get_chapter_info.num) < to_int(next_chapter.num)) {
            next_chapter.num = to_int(get_chapter_info.num);
            next_chapter.id = value.id_chapter;
        }
    });
    $('.chapter_control .chapter_list').html(chapter_html);
    if (previous_chapter.id != 0) {
        $('.chapter_control .previous_chapter').attr('value', previous_chapter.id);
        $('.chapter_control .previous_chapter').show();
    }
    if (next_chapter.id != 0) {
        $('.chapter_control .next_chapter').attr('value', next_chapter.id);
        $('.chapter_control .next_chapter').show();
    }
    html = html + '<div class="clear"></div>';
    $('.chapter_loading').hide();
    $('.chapter_control').show();
    $(`#chapter_content_${chapter_id} .chapter_content`).html(html);
    addTargetToParagraphs(chapter_id);
    window.history.pushState('', '', '/album/' + album_info.url + '/chapter-' + chapter_info.num + '-' + chapter_id);
    comment_data = {
        "album": album_id,
        "chapter": chapter_id,
        "comment": 0
    };
    load_module('book_comment', 'other/comment', 'no');
    setTimeout(function () {
        $(".chapter_lazyload").each(function (index) {
            $(this).attr('src', $(this).attr('data-src'));
        });
    }, 1500);
    var fly_comment_setting = getSetting('fly_comment') ?? "yes";
    if(!fly_comment.list[chapter_id] && fly_comment_setting == "yes"){
        var fly_comment_list = await get_data_by_url(`/api/comment_fly?album=${album_id}&chapter=${chapter_id}`);
        if(Object.keys(fly_comment_list).length > 0){
            var list_put_data = [];
            $.each(fly_comment_list, function (index, value) {
                var member_info = json_convert(value.info);
                var comment_data = json_convert(value.data);
                var put_data = {
                    "name" : member_info.name,
                    "avatar" : member_info.avatar,
                    "text" : comment_data.text,
                } 
                if(!list_put_data[comment_data.page]){
                    list_put_data[comment_data.page] = [];
                }
                list_put_data[comment_data.page].push(put_data);
            });
            fly_comment.list[chapter_id] = list_put_data;
        }
    }
    $(document).ready(function() {
        const observerOptions = {
            root: null, 
            rootMargin: '0px',
            threshold: Array.from({length: 11}, (_, i) => i / 10) // Các mốc từ 0.1 đến 1.0
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    var page = $(entry.target).attr('page');
                    var chapter = $(entry.target).attr('chapter');
                    var url = $(entry.target).attr('src');
                    fly_comment.comment.chapter = chapter;
                    fly_comment.comment.page = page;
                    fly_comment.comment.url = url;
                    if(fly_comment.list[chapter]){
                        if(fly_comment.list[chapter][page]){
                            $.each(fly_comment.list[chapter][page], function (index, value) {
                                comment_fly_load(value.avatar,value.name,value.text);
                            });
                            delete fly_comment.list[chapter][page];
                        }
                    }
                }
            });
        }, observerOptions);
        setTimeout(function () {
            $('.chapter_image').each(function() {
                observer.observe(this);
            });
        }, 1500);
    });
    setTimeout(function () {
        chapter_load_more = 1;
    }, 7000);
    if(chapter_content.status == 1){
        chapter_view(chapter_id);
    }
    if (token_user != 0) {
        album_history_update(chapter_info.album, chapter_id, chapter_info.num);
    }
    if(album_file == "text"){
        var text_setting = getSetting('text_setting') ?? null;
        if(text_setting){
            var text_margin_bottom = text_setting.margin_bottom ?? 20;
            var font_weight = text_setting.font_weight ?? 600;
            $('.chapter_content .chapter_text').attr('style',`font-family: ${text_setting.font_family};font-size: ${text_setting.font_size}px;line-height: ${text_setting.line_height}px;color: ${text_setting.color};background-color: ${text_setting.background_color};text-align: ${text_setting.text_align}; font-weight: ${font_weight};`);
            $('.chapter_content .chapter_text p').css('margin-bottom',text_margin_bottom+'px');
        }
        $('#chapter_text_setting').show();
    }else{
        $('#chapter_text_setting').hide();
    }
    chapter_load_page();
    chapter_load_page();
    chapter_load_page();
}

function chapter_text_to_html(inputText) {
    // Tách đoạn theo dòng trống và cả thẻ <br>, <br/>, <br />, </br>
    // Quy ước: cụm thẻ xuống dòng liên tiếp sẽ được chuẩn hóa thành 2 ký tự xuống dòng để tạo ranh giới đoạn
    let normalized = inputText.replace(/(?:<br\s*\/?>|<\/br\s*>)+/gi, '\n\n');
    let paragraphs = normalized.split(/\n\s*\n+/);
    let result = paragraphs.map(paragraph => `<p>${paragraph.trim()}</p>`).join('');
    return result;
}

function chapter_unlock(e){
    $(e).prop('disabled', true);
    $.post('assets/ajax/user.php', { action: "chapter_unlock", chapter_id : chapter_id}, function (data) {
        $(e).prop('disabled', false);
        var data = JSON.parse(data);
        if(data.status == 1){   
            chapter_image_render();
        }
        alertify.success(data.message);
    });
}

function chapter_ads(){
    let popup = window.open('/redirect.php', '_blank');
    setTimeout(() => {
        var adsView = "yes";
        if (adsView == "no") {
            alertify.error('Quảng cáo bị tắt đột ngột. Hãy tắt chức năng Chặn Quảng Cáo hoặc đổi trình duyệt khác.');
        }else{
            popup_close();
            setCookie('ads_num', -9999999);
            $('.chapter_content').css('opacity', '1');
            $('.chapter_ad_block').addClass('hide');
            $('.fly_comment').show();
        }
    }, 2500);
}

function transaction_log_convert(log){
    var log = json_convert(log);
    var note = getSafe(() => json_data.language['imanage_accountant_type_'+log.target], "N/A");
    if(log.target == 'BuyPackage'){
        note = note + ' #' + log.package;
    }else if(log.target == 'market'){
        note = note + ` <a onclick="popup_data= {'id':'${log.target_id}'};popup_load('game/market/buy_confirm','no')">#${log.target_id}</a>`;
    }else if(log.target == 'guildCrystal'){
        note = note + ` <a onclick="popup_data = {'guild_id':'${log.guildId}'};popup_load('profile/guild');">#${log.guildId}</a>`;
    }else if(log.target == 'adCrystal' || log.target == 'crystalTransfer'){
        note = note + ` <a onclick="popup_data = {'target':'character','id':'${log.user_id}'};popup_load('profile/character')">#${log.user_id}</a>`;
    }
    return note;
}

function comment_render(data, type = "comment") {
    var comment_data = json_convert(data.data);
    comment_data.text = detect_emoji(comment_data.text);
    if (comment_data.user) {
        comment_data.text = '<span class="user_name"><i class="fas fa-reply"></i> ' + comment_data.user + '</span> ' + comment_data.text;
    }
    var user_info = json_convert(data.info);
    var premium_level = getSafe(() => user_info.premium.level, 0);
    var premium_effect = getSafe(() => user_info.premium.effect, 1);
    var comment_note = comment_data.note != '' ? " · <a>" + comment_data.note + "</a>" : "";
    var total_like = getSafe(() => comment_data.like, 0)
    var zoom = (total_like / 1000) + 1;
    var onclick = `member_profile('${data.id_user}')`;
    var reply_html = ``;
    var class_html = ``;
    var button_html = `<a onclick="popup_data={'user_id':'${data.id_user}','target_id':'${data.id_comment}','target_type':'comment'};popup_load('user/like')" style='color: #31cbff;zoom: ${zoom};'><i class="fa-solid fa-thumbs-up"></i> <span id="like_comment_${data.id_comment}">${number_format(total_like)}</span></a> · `;
    if (token_permission <= 3) {
        button_html += `<a onclick="comment_delete_all(${data.id_user});$(this).parent().parent().parent().hide();">${language_text('text_delete_all')} · </a>`;
    }
    if (comment_data.reply) {
        button_html += `<a album='${data.id_album}' chapter='0' comment='${data.id_comment}' type="reply" class="reply_load" onclick="comment_load(this);$(this).hide();">${language_text('text_view_reply', [comment_data.reply])} · </a>`;
        if (parseInt(comment_data.reply) <= 5 && comment_data.reply != 0) {
            setTimeout(() => {
                $(`#comment_${data.id_comment} .reply_load`).click();
            }, 300);
        }
    }
    var class_html = `parent_li`;
    if (type == 'comment') {
        var reply_html = `
            <div style="display: none;" class="comment_list_hidden">
                <ul class="comment_list_child comment_list_${data.id_album}_0_${data.id_comment}">
                </ul>
            </div>
            <div class="comment_reply">
                <input class="comment_text_value" placeholder="${language_text('text_comment_text')}">
                <i album='${data.id_album}' chapter='${data.id_chapter}' comment='${data.id_comment}' onclick="comment_send(this)" class="fas fa-paper-plane send_icon"></i>
                <div class="user_name"></div>
            </div>
            <div class="clear"></div>  
        `;
        button_html += `<a onclick="reply_comment(this);" target="comment">${language_text('text_reply_button')}</a> · `;
    } else if (type == "new") {
    } else {
        button_html += `<a onclick="reply_comment(this);" target="reply">${language_text('text_reply_button')}</a> · `;
    }
    return `
        <li id="comment_${data.id_comment}" class="${class_html}">
            <div class="user_profile_div">
                <div class="user_avatar">
                    <img class="user_image" src="/assets/tmp/avatar/${user_info.avatar}">
                    <div class="user_frame">${user_frame_render(user_info)}</div>
                </div>
            </div>
            <div class="detail_div">
                <div class="detail">
                    <i class="fas fa-caret-left comment_mark"></i>
                    <div class="name"><span class="badge_div"><a onclick="${onclick}" class="name premium_name_${premium_level} premium_name_${premium_level}_${premium_effect} " user="${data.id_user}">${user_info.name}</a> ${user_badge_render(user_info)}</span> <a>${comment_note}</a></div>
                    <p class="text">${comment_data.text}</p>
                </div>
                <p class="comment_menu"> ${button_html} <span class="time">${time_format(data.date)}</span></p>
            </div>
            <div class="clear"></div>
            ${reply_html}
        </li>
    `;
}

function comment_delete_all(user_id) {
    alertify.confirm('Bạn có chắc chắn xóa toàn bộ bình luận của người này', function(){ 
        $.post("/assets/ajax/imanage.php", { action: 'comment_delete', user_id: user_id }, function (data) {
            $('#result').html(data);
         });
     }).set('labels', {ok:language_text('text_yes'), cancel:language_text('text_no')});
}
function reply_comment(e) {
    var target = $(e).attr('target');
    if (target == "comment") {
        var comment_input = $(e).parent().parent().parent().children('.comment_reply');
    } else if (target == "reply") {
        var comment_input = $(e).parent().parent().parent().parent().parent().parent().children('.comment_reply');
    }
    var detail_div = $(e).parent().parent().children('.detail');
    var name = detail_div.children('.name').children('.badge_div').children('a').html();
    var user_id = detail_div.children('.name').children('.badge_div').children('a').attr('user');
    comment_input.show();
    if (user_id != token_user) {
        comment_input.children('.user_name').html(`<i class="fas fa-reply"></i> <span>${name}</span>`);
        comment_input.children('.user_name').show();
    } else {
        comment_input.children('.user_name').hide();
    }
    comment_input.children('.comment_text_value').focus();
    comment_input.children('svg').attr('user', user_id);
    $([document.documentElement, document.body]).animate({
        scrollTop: comment_input.offset().top - 200
    }, 200);
}

function comment_add(data) {
    data.info = my_profile.info;
    if (data.comment != 0) {
        $(`.comment_list_${data.album}_${data.chapter}_${data.comment}`).append(comment_render(data, "new"));
    } else {
        $(`.comment_list_${data.album}_${data.chapter}_${data.comment}`).prepend(comment_render(data, "new"));
    }
    if (data.comment != '0') {
        $(`#comment_${data.comment} .comment_list_hidden`).show();
    }
}

async function language_render(array) {
    await get_json_data('language', 'lang');
    $.each(array, function (key, value) {
        $('.' + value).html(json_data.language[value]);
        $('.' + value).attr('placeholder', json_data.language[value]);
    });
}

function load_daily_popup(popup_number) {
    if(popup_number != 0){
        if (!getCookie('daily_popup_' + popup_number)) {
            setCookie('daily_popup_' + popup_number, 'yes', 24);
            popup_load('manage/announcement');
        }
    }
}

async function activity_position_render() {
    player_score = await get_data_by_url(`/api/score_check?target=${my_character}&type=${activity_position_data.activity}&only_num=no&v=${server_time}`);
    my_character_data = await get_data_by_url('/api/get_data_by_id?table=game_character&data=info,other&id=' + my_character + '&v=' + server_time);
    my_character_data.info = JSON.parse(my_character_data.info);
    my_character_data.other = JSON.parse(my_character_data.other);
    if (player_score.data != '') {
        player_score.data = json_convert(player_score.data);
        if (player_score.data.status == 'death') {
            $('.user_game_module .fight .button_style .fight').addClass('hide');
            $('.user_game_module .fight .button_style .restore').addClass('hide');
            $('.user_game_module .fight .button_style .reset').removeClass('hide');
            setTimeout(() => {
                $('.user_game_module.activity_position .battle .formation.player .image').css('filter', 'grayscale(1)');
            }, 500);
        } else {
            $('.user_game_module .fight .button_style .fight').removeClass('hide');
            $('.user_game_module .fight .button_style .restore').removeClass('hide');
            $('.user_game_module .fight .button_style .reset').addClass('hide');
            $('.user_game_module.activity_position .battle .formation.player .image').css('filter', 'grayscale(0)');
        }
    } else {
        var position_list = getSafe(() => my_character_data.other.activity_position[activity_position_data.activity], [])
        player_score.data = { list: position_list };
        $('.user_game_module .fight .button_style .fight').removeClass('hide');
        $('.user_game_module .fight .button_style .restore').addClass('hide');
        $('.user_game_module .fight .button_style .reset').addClass('hide');
    }

    var html = '';
    for (i = 1; i <= 6; i++) {
        if (player_score.data.list[i]) {
            if (player_score.data.list[i].type == "pet") {
                var avatar = "assets/img/level/pet/" + player_score.data.list[i].avatar;
            } else if (player_score.data.list[i].type == "friend") {
                var avatar = "assets/img/level/friend/avatar/" + player_score.data.list[i].avatar + ".png";
            } else {
                var avatar = "assets/tmp/avatar/" + player_score.data.list[i].avatar;
            }
            var max_hp = getSafe(() => player_score.data.list[i].max_hp, 999999);;
            var current_hp = getSafe(() => player_score.data.current_hp[my_character + '_' + player_score.data.list[i].id], 999999);
            var percent = (current_hp / max_hp) * 100;
            html += `
                <div onclick="popup_data = {'target':'${i}'};popup_load('game/battle/activity_position_select');" class="item"> 
                    <img class="image" src="${avatar}">
                    <div class="hp_mp_bar">
                        <div class="bar_div hp">
                            <div style="width: ${percent}%;" class="bar"></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div onclick="popup_data = {'target':'${i}'};popup_load('game/battle/activity_position_select');" class="item"> 
                    <img class="image" src="/assets/img/level/icon/activity_position_select.png">
                </div>
            `;
        }
    }
    $('.user_game_module .fight .formation.player').html(html);
    return player_score;
}

function activity_position_select(e) {
    var type = $(e).attr('type');
    var target = $(e).attr('target');
    popup_close();
    $.post('assets/ajax/character_activity.php', { action: "activity_position_select", type: type, target: target, position: popup_data.target, activity: activity_position_data.activity }, function (data) {
        $('#result').html(data);
    });
}

function language_text(var_name, data = []) {
    var text_return = "";
    if (json_data.language) {
        if (json_data.language[var_name]) {
            var text_return = json_data.language[var_name];
            if (data.length > 0) {
                $.each(data, function (key, value) {
                    text_return = text_return.replace(`:value_${key}:`, value);
                });
            }
        }
    }
    return text_return;
}

function auto_substr(str, length) {
    let output = "";
    let charCount = 0;
    let isTag = false;
    let buffer = "";
    var string_cut = false

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === '<') {
            isTag = true;
        }

        if (!isTag) {
            if (char === ' ' || char === '\n' || char === '\t') {
                output += buffer + char;
                buffer = "";
            } else {
                buffer += char;
            }

            charCount++;

            if (charCount >= length) {
                string_cut = true;
                break;
            }
        } else {
            buffer += char;
            if (char === '>') {
                isTag = false;
                output += buffer;
                buffer = "";
            }
        }
    }
    if(string_cut){
        var remain_string = str.substring(output.length);
        output += '<a class="auto_substring" onclick="$(this).parent().children(`.string_remain`).slideDown();$(this).hide();">... Xem thêm</a><span class="string_remain hide">' + remain_string + '. <a class="auto_substring" onclick="$(this).parent().slideUp();$(this).parent().parent().children(`.auto_substring`).show();">Ẩn bớt</a></span>';
    }
    return output;
}
