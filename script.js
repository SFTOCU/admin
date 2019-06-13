var smartView = false;
var contentWidth = 100;
var contentHeight = 100;
var device = "pc";
window.onload = function () {
    var ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        device = "mobile";// スマートフォン用コード
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
        device = "tablet";// タブレット用コード
    }
    if((device=="pc"&&window.innerWidth<600)||device!="pc"){
        smartView=true;
        document.getElementById("app").classList.add("smartView");
        contentWidth = Math.round(window.innerWidth/2)-30;
        contentHeight = contentWidth;
    }
    myApp = new Vue({
        el:"#app",
        data:{
            login:true,
            liff:false,
            userName:"リンゴ",
            userId:"",
            studentNumber:"",
            password:"",
            contentStyle:"width:"+contentWidth.toString()+";height:"+contentHeight.toString(),
        },
        methods:{
            logIn:function(){
                this.login = true;
            },
            logOut:function(){
                alert([device,window.innerWidth]);
                this.login = false;   
            },
        }
    });
};