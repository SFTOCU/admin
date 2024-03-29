
var app = new Vue({
    el:"#app",
    data:{
        windowWidth:0,
        windowHeight:0,
        editting:-1,
        authcheck:false,
        buf_price:undefined,
        reservator:undefined,
        reservatorId:undefined,
        staff:undefined,
        display_isbn:undefined,
        display_priceSum:undefined,
        display_payment:undefined,
        display_change:undefined,
        purchasecode:undefined,
        payload:{
            command:"",//check,purchase
            data:"",
        },
        content:{
            password:"",
        },
        bookList:[
        ],
        cancelList:[],
        reservationList:[
        ],
        state:1,
        message1:"OOの値段を変更中"
    },
    methods:{
        changePrice:function(x){
            if(this.state!=1)return alert("金額変更はできません。現在の操作を完了してください。")
            this.editting=x;
            this.buf_price=this.bookList[x].price;
            this.state=0;
        },
        confirmPrice:function(){
            if(this.state==0){
                this.bookList[this.editting].price=this.buf_price;
                this.editting=-1;
                this.buf_price=undefined;
                this.state=1;
            }
            if(this.state==3){
                if(this.buf_price < this.display_priceSum){
                    this.buf_price = undefined;
                    return alert("支払い金額が足りません。")
                }
                this.display_payment = this.buf_price;
                this.display_change = this.display_payment - this.display_priceSum;
                this.buf_price=undefined;
                this.state=4;
            }
        },
        editPrice:function(x){
            if(x==-1){
                if(this.buf_price>9)this.buf_price = Math.floor(this.buf_price/10);
                else this.buf_price = undefined;
            }
            else if(x==-2)this.buf_price = undefined;
            else if(this.buf_price!=undefined)this.buf_price = this.buf_price*10+x;
            else this.buf_price = x;
        },
        editISBN:function(x){
            if(x==-1){
                if(this.display_isbn>9)this.display_isbn = Math.floor(this.display_isbn/10);
                else this.display_isbn = undefined;
            }
            else if(x==-2)this.display_isbn = undefined;
            else if(this.display_isbn!=undefined){
                if(x==9784&&this.display_isbn!="")return alert("このボタンは頭4文字を入力するときだけ使えます。")
                this.display_isbn = this.display_isbn*10+x;
            }
            else this.display_isbn = x;
        },
        deleteBook:function(x,direct){
            if(direct==undefined){
                if(this.state!=1)return alert("購入取り消しはできません。現在の操作を完了してください。")
                if(!confirm(this.bookList[x].title + "の購入をキャンセルします。"))return
            }
            if(this.bookList[x].reserved)return app.bookList.splice(x,1)[0]
            this.content.code = this.bookList[x].code;
            postData("cancel",function(data){
                if(data.error||data.res.error)return alert(JSON.stringify(data))
            });
            app.cancelList.push(app.bookList.splice(x,1)[0]);
        },
        makeSum:function(){
            if(this.state!=1)return alert("購入処理を進められません。現在の操作を完了してください。")
            if(isNaN(this.priceSum))return alert("購入処理を進められません。全ての書籍の金額を設定してください。")
            if(this.priceSum==0)return 
            this.display_priceSum = this.priceSum;
            this.state=2;
        },
        backState:function(){
            //alert(this.state);
            if(this.state==0){
                this.editting=-1;
                this.buf_price=undefined;
                this.state=1;
            }
            else if(this.state==1){
                if(!confirm("読み込んだ全ての書籍を消去して購入処理を中止します"))return
                var buf = [];
                this.bookList.forEach((value)=>{
                    if(!value.reserved){
                        buf.push(value.code);
                    }
                });
                app.content.codeList = buf;
                postData("multicancel",function(data){
                    if(data.error||data.res.error)return alert(JSON.stringify(data))
                });
                this.bookList = [];
                this.reservator = undefined;
                this.reservatorId = undefined;
            }
            else if(this.state==2){
                this.display_priceSum = undefined;
                this.state=1;
            }
            else if(this.state==3){
                this.display_priceSum = undefined;
                this.display_payment = undefined;
                this.buf_price=undefined;
                this.state=1;
            }
            else if(this.state==4){
                this.display_payment = undefined;
                this.display_change = undefined;
                this.state=3;
            }
            else if(this.state==-1){
                $(".reservationList").css("overflow-y","hidden");
                this.state=1;
            }
        },
        nextState:function(){
            if(this.state!=2&&this.state!=4)return alert("購入処理を進められません。現在の操作を完了してください。")
            if(this.state==2)this.state=3;
            else{
                var buf = [];
                this.bookList.forEach((value)=>{
                    buf.push(value.code);
                });
                this.content.paymentData = {
                    userName:this.reservator,
                    staffName:this.staff,
                    price:this.display_priceSum,
                    payment:this.display_payment,
                    change:this.display_change,
                    codeList:buf
                };
                postData("record",function(data){
                    if(data.error||data.res.error)return alert(JSON.stringify(data))
                    app.purchasecode = data.res.success;
                    app.state = 5;
                });
                
            }
        },
        confirmPurchase:function(){
            if(this.state!=5)return alert("購入処理を進められません。現在の操作を完了してください。")
            var buf = [];
            this.bookList.forEach((value)=>{
                buf.push(value.code);
            });
            this.content.codeList = buf;
            this.content.purchasecode = this.purchasecode;
            postData("purchase",function(data){
                if(data.error||data.res.error)return alert(JSON.stringify(data))
                app.display_priceSum = undefined;
                app.display_payment = undefined;
                app.buf_price=undefined;
                app.display_change = undefined;
                app.reservator = undefined;
                app.reservatorId = undefined;
                app.purchasecode = undefined;
                app.cancelList = new Array();
                app.bookList = new Array();
                app.state=1;
            });
        },
        showReservations:function(){
                postData("inquiry",function(data){
                    if(data.error)return alert(data.error);
                    app.reservationList = data.res;
                    if(data.res.length==0)return alert("予約はありません。");
                    $(".reservationList").css("overflow-y","scroll");
                });//予約の問い合わせ
            
            this.state=-1;
        },
        cancelReservation:function(x){
            var msg = this.reservationList[x].reservator+" 様 の以下"+this.reservationList[x].books.length+"冊の予約を取り消します。"
            this.reservationList[x].books.forEach((value)=>{
                msg += ("\n・"+value.title);
            });
            if(!confirm(msg))return alert("予約取り消しを中止しました。")
            var buf = [];
            this.reservationList[x].books.forEach((value)=>{
                buf.push(value.code);
            });
            this.content.codeList = buf;
            postData("multicancel",function(data){
                if(data.error||data.res.error)return alert(JSON.stringify(data))
                app.reservationList.splice(x,1);
            });
        },
        addCartFromReservation:function(x){
            var isbns = [];
            var msg = this.reservationList[x].reservator+" 様 の以下"+this.reservationList[x].books.length+"冊の予約を読み込みます。"
            this.reservationList[x].books.forEach((value)=>{
                isbns.push(value.isbn);
                msg += ("\n・"+value.title);
            });
            if(!confirm(msg))return alert("読み込みを中止しました。")
            if(this.reservatorId&&this.reservatorId!=this.reservationList[x].reservatorId)return alert("既に別のお客様の予約を読み込んでいます")
            var catChange=[];
            var catChange_isbn = [];
            var catChange_code = [];
            for(var i in this.bookList){
                if(this.bookList[i].code.indexOf(this.reservationList[x].code)!=-1){
                    return alert("既に読み込み済みの予約です")
                }
                isbns.forEach((value,index)=>{
                    if(app.bookList[i].isbn==value){
                        catChange.push(app.bookList[i].title);
                        catChange_isbn.push(app.bookList[i].isbn);
                        if(!app.bookList[i].reserved)catChange_code.push(app.bookList[i].code);
                        app.cancelList.push(app.bookList[i]);
                        app.bookList[i].code = app.reservationList[x].books[index].code;
                        app.bookList[i].reserved = true;
                    }
                });
            }
            if(catChange.length>0)alert("以下"+catChange.length+"冊の購入区分を「予約購入」に変更しました。\n・"+catChange.join("\n・"));
            if(catChange_code.length>0){
                app.content.codeList = catChange_code;
                postData("multicancel",function(data){
                    if(data.error||data.res.error)return alert(JSON.stringify(data))
                });
            }
            this.reservatorId = this.reservationList[x].reservatorId;
            this.reservator = this.reservationList[x].reservator;
            this.reservationList[x].books.forEach((value)=>{
                if(catChange_isbn.indexOf(value.isbn)==-1)this.bookList.push(value);
            });
            $(".reservationList").css("overflow-y","hidden");
            this.state=1;
        },
        isbnAutoCheck:function(x){
            if(!digitCheck(this.display_isbn)&&x==0)return console.log(this.display_isbn)
            var isbns = [];
            this.bookList.forEach((value)=>{
                isbns.push(Number(value.isbn));
            });
            console.log(isbns)
            if(isbns.indexOf(Number(this.display_isbn))!=-1)return alert("既に入力済みです")
            this.content.isbn = this.display_isbn;
            this.content.userName = this.reservator;
            postData("check",function(data){
                if(data.error||data.res.error)return alert(JSON.stringify(data))
                var buf = {reserved:false};
                buf.title = data.res.success[4];
                buf.isbn = data.res.success[0];
                buf.price = data.res.success[5];
                buf.code = data.res.success[6];
                app.bookList.push(buf);
                app.display_isbn=undefined;
                //alert(JSON.stringify(data));
            });
        },
    },
    computed:{
        style_inp:function(){
            return{
                width:(this.windowWidth-10)+"px",
                height:(this.windowHeight*0.06-10)+"px",
                textAlign:"center",
            }
        },
        style_keybase:function(){
            var buf = "";
            if(this.state==1)buf="rotateY(90deg)";
            else if(this.state==-1)buf="rotateY(-90deg)";
            else if(this.state==0){
                buf="rotateY(0deg)";
                this.message1=this.bookList[this.editting].title+"の金額を変更中";
            }
            else if(this.state==3){
                buf="rotateY(0deg)";
                this.message1="支払い金額入力";
            }
            else buf="rotateY(180deg)";
            return{
                width:(this.windowWidth*0.65-5)+"px",
                height:(this.windowHeight*0.55-5)+"px",
                transform:buf,
            }
        },
        style_keyboard:function(){
            return {
                width:(this.windowWidth*0.6-5)+"px",
                height:(this.windowHeight*0.55-5)+"px",
            }
        },
        style_books:function(){
            return {
                width:(this.windowWidth-10)+"px",
                height:(this.windowHeight*0.4)+"px",                
                border:"ridge",
            }
        },
        style_process:function(){
            return {
                width:(this.windowWidth*0.4-5)+"px",
                height:(this.windowHeight*0.55-5)+"px",
            }
        },
        style_buttons:function(){
            return {
                width:(this.windowWidth*0.35-5)+"px",
                height:(this.windowHeight*0.25-5)+"px",
            }
        },
        priceSum:function(){
            var buf = 0;
            for(var i in this.bookList){
                buf += this.bookList[i].price;
            }
            return buf
        },
    }
});

$(function(){
    console.log({"-1":"予約",0:"金額変更",1:"ISBN入力画面",2:"合計確認",3:"購入確定",4:"購入処理中"});
    app.content.password = prompt("認証パスワードを入力してください");
    postData("auth",function(data){
        if(data.error){
            alert(data.error);
        }
        else{
            app.staff = prompt("認証完了しました。操作者名を入力してください。");
            app.authcheck = true;
        }
    
    });
    app.windowWidth = window.innerWidth;
    app.windowHeight = window.innerHeight;
    if(app.windowHeight<500)app.windowHeight=640;
    onresize=function(){
        app.windowWidth = window.innerWidth;
        app.windowHeight = window.innerHeight;
        if(app.windowHeight<500)app.windowHeight=640;
    }
    window.onbeforeunload = function(){
        return "正しく購入処理を中止させてからページを離れます。"
    }
});

function postData(command,func){
    app.payload.data = JSON.stringify(app.content);
    app.payload.command = command;
    console.log(app.payload);
    $("button").attr("disabled",true);
    $.post("https://script.google.com/macros/s/AKfycbya4H_U5UB_LAxF07NwMG06rYY0tvUkrOxdQiG0JB4bbybnOZo/exec",
      app.payload,
      function(dt){
        func(dt);
        $("button").attr("disabled",false);
      }
    );
}

function digitCheck(code){
    var str = code.toString();
    if(str.length != 13)return false
    var even = [];
    var odd = [];
    for(var i = 0;i<str.length-1;i++){
    if(i%2==0)even.push(str[i]);
        else odd.push(str[i]);
    }
    var cd = (10 - (sum(even)*3 + sum(odd)) % 10) % 10;
    return cd==Number(str[str.length-1])
}
function sum(arr){
    if(arr.length == 1)return Number(arr[0])
    else if(arr.length == 2)return Number(arr[0]) + Number(arr[1])
    else return sum([Number(arr[0]) + Number(arr[1])].concat(arr.slice(2)))
}