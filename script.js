var smartView = false;
var contentWidth = 100;
var contentHeight = 100;
window.onload = function () {
    if(window.innerWidth<600){
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
                alert(window.innerWidth);
                this.login = false;   
            },
        }
    });
};