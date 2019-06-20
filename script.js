window.onload = function () {
    var smartView = false;
    var contentWidth = 100;
    var contentHeight = 100;
    var device = "pc";
    var ua = navigator.userAgent;
    payload = {
        command:"",
        userId:"pcUser",
        isSaved:"false"
    };
    mainData = {};
    
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        device = "mobile";// スマートフォン用コード
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
        device = "tablet";// タブレット用コード
    }
    if((device=="pc"&&window.innerWidth<600)||device!="pc"){
        smartView=true;
        document.getElementById("app").classList.add("smartView");
        contentWidth = Math.round(window.innerWidth/2)-40;
        contentHeight = contentWidth;
    }
    location.hash = (location.hash!=""?location.hash:"#home");
    myApp = new Vue({
        el:"#app",
        data:{
            login:false,
            liff:false,
            view:location.hash,
            maskview:false, 
            pwview:false,
            userName:"",
            studentNumber:"",
            password:"",
            hashedPass:"",
            contentStyle:{
                width:contentWidth,
                height:contentHeight,
            }
        },
        methods:{
            logIn:function(){
                if(this.liff){
                    payload.command = "liff";
                    return postData(function (res){
                        if(!res.success){
                            myApp.view = "#login";
                            return alert(JSON.stringify(res));
                        }
                        myApp.userName = res.data.userName;
                        myApp.hashedPass = res.data.password;
                        myApp.login = true;
                        myApp.view = location.hash;
                    });
                }
                if(this.studentNumber==""||this.password==""){
                    if(this.view!="#login")return this.view = "#login";
                    else return alert("学籍番号とパスワードを入力してください");
                }
                payload.password = this.password;
                payload.studentNumber = this.studentNumber;
                payload.command = "login";
                postData(function (res){
                    if(!res.success)return alert(JSON.stringify(res));
                    myApp.userName = res.data.userName;
                    myApp.hashedPass = res.data.password;
                    myApp.login = true;
                    myApp.view = location.hash;
                    if(document.getElementById("login_saved").checked){
                        document.cookie = "password="+res.data.password+"; max-age=8640000;";
                        document.cookie = "studentNumber="+myApp.studentNumber+"; max-age=8640000;";
                        alert(document.cookie);
                    }
                });
                
            },
            logOut:function(){
                this.login = false; 
                payload.isSaved = "false";
                document.cookie = "password=; max-age=0;";
                document.cookie = "studentNumber=; max-age=0;";
                myApp.password = "";
                myApp.view = "#login";
            },
            pwViewClick:function(){
                this.pwview = !this.pwview;
            },
            snCheck:function(){
                this.studentNumber = this.studentNumber.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
                    return String.fromCharCode(s.charCodeAt(0) - 65248);
                }).replace(/[a-z]/g, function(ch) {
                    return String.fromCharCode(ch.charCodeAt(0) & ~32);
                });
            },
            register:function(){
                if(payload.userId == "pcUser")return alert("この操作はLINEからしか行えません");
                if(this.userName==""||this.studentNumber==""||this.password=="")return alert("全ての入力欄を埋めてください。");
                if(!confirm("氏名:"+this.userName+"\n学籍番号:"+this.studentNumber+"\nPW:"+this.password+"\nで登録します。"))return alert("キャンセルさしました");
                payload.password = this.password;
                payload.studentNumber = this.studentNumber;
                payload.command = "register";
                payload.isSaved = "false";
                mainData.userName = this.userName;
                payload.data = JSON.stringify(mainData);
                postData(function (res){alert(res);});
            }
        }
    });
    window.onhashchange = function(){
        myApp.view = location.hash;   
    };
    liff.init(
        data => {
            payload.userId = data.context.userId;
            myApp.liff = true;
            location.hash  = "#"+location.search.slice(1);
            if(!myApp.login)myApp.logIn();
        },
        err => {
            myApp.liff = false;
            if(document.cookie.length>0){
                var buf = document.cookie.split(";");
                var cookies = {};
                for(var i = 0;i<buf.length;i++){
                    var buf2 = buf[i].trim().split("=");
                    cookies[buf2[0]] = buf2[1];
                }
                payload.command = "login";
                payload.password = cookies.password;
                payload.studentNumber = cookies.studentNumber;
                payload.isSaved = "true";
                postData(function(res){ 
                    if(!res.success){
                        myApp.view = "#login";
                        payload.isSaved = "false";
                        return alert(JSON.stringify(res));
                    }
                    myApp.userName = res.data.userName;
                    myApp.hashedPass = res.data.password;
                    myApp.login = true;
                });
            }
            else myApp.view = "#login";
        }
    );
    
};

var xhr = new XMLHttpRequest();

function postData(func){
    xhr.open("post", "https://script.google.com/macros/s/AKfycbzcLvKnI694cSQ5s1QGMyrmv2leXfw_aP57kmdFGk6K0KsVbmE/exec");
    
    xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
    
    myApp.maskview = true;
// データをリクエスト ボディに含めて送信する
    xhr.send(serialize(payload));
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
            myApp.maskview = false;
            func(JSON.parse(xhr.response));
        //データを取得した後の処理を書く
        }
    };
}

function serialize(data) {
    var key, value, type, i, max;
    var encode = window.encodeURIComponent;
    var query = '';
 
    for (key in data) {
        value = data[key];
        type = typeof(value) === 'object' && value instanceof Array ? 'array' : typeof(value);
        switch (type) {
            case 'undefined':
                // キーのみ
                query += key;
                break;
            case 'array':
                // 配列
                for (i = 0, max = value.length; i < max; i++) {
                    query += key + '[]';
                    query += '=';
                    query += encode(value[i]);
                    query += '&';
                }
                query = query.substr(0, query.length - 1);
                break;
            case 'object':
                // ハッシュ
                for (i in value) {
                    query += key + '[' + i + ']';
                    query += '=';
                    query += encode(value[i]);
                    query += '&';
                }
                query = query.substr(0, query.length - 1);
                break;
            default:
                query += key;
                query += '=';
                query += encode(value);
                break;
        }
        query += '&';
    }
    query = query.substr(0, query.length - 1);
    return query;
};
