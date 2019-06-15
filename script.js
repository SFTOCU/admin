window.onload = function () {
    var smartView = false;
    var contentWidth = 100;
    var contentHeight = 100;
    var device = "pc";
    var ua = navigator.userAgent;
    var payload = {
        command:"",
        userId:"pcUser",
        password:"",
        studentNumber:"",
        isSaved:"true"
    };
    var mainData = {};
    
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
    myApp = new Vue({
        el:"#app",
        data:{
            login:false,
            liff:false,
            view:"#home",
            maskview:false, 
            pwview:false,
            userName:"",
            userId:"",
            studentNumber:"",
            password:"",
            contentStyle:{
                width:contentWidth,
                height:contentHeight,
                textAlign:"center",
                fontSize:"1.8em",
                margin:"3px",
                border:"ridge 10px lightblue",
                backgroundColor:"aliceblue",
            }
        },
        methods:{
            logIn:function(){
                if(this.studentNumber==""||this.password==""){
                    location.hash="#login";
                    this.view = "#login";
                    return alert("学籍番号とパスワードを入力してください");
                }
                payload.password = this.password;
                payload.studentNumber = this.studentNumber;
                payload.command = "login";
            },
            logOut:function(){
                this.login = false;   
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
                if(this.userName==""||this.studentNumber==""||this.password=="")return alert("全ての入力欄を埋めてください。");
                if(!confirm("氏名:"+this.userName+"\n学籍番号:"+this.studentNumber+"\nPW:"+this.password+"\nで登録します。"))return alert("キャンセルさしました");
            }
        }
    });
    window.onhashchange = function(){
        myApp.view = (location.hash!=""?location.hash:"#home");   
    };
    liff.init(
        data => {
            myApp.userId = data.context.userId;
            myApp.liff = true;
            if(!myApp.login)myApp.logIn();
        },
        err => {
            myApp.liff = false;
            location.hash = "#login";
        }
    );
    
};

var xhr = new XMLHttpRequest();
function postData(data,func){
    xhr.open("post", );
    xhr.send();
    xhr.onreadystatechange = function() {
 
        if(1) {
 
        //データを取得した後の処理を書く
        }
    }
}

function serialize(data) {
    var key, value, type, i, max;
    var encode = window.encodeURIComponent;
    var query = '?';
 
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
