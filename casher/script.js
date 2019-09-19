
var app = new Vue({
    el:"#app",
    data:{
        windowWidth:0,
        windowHeight:0,
        editting:-1,
        buf_price:undefined,
        display_priceSum:undefined,
        display_payment:undefined,
        display_change:undefined,
        bookList:[
            {isbn:"000000000000", title:"title1", price:1000, code:"xxxx"},
            {isbn:"000000000001", title:"title2", price:undefined,code:"xxxx"},
        ],
        cancelList:[],
        reservationList:[
            {
                code:00000000,name:"name1",
                books:[
                    {isbn:"000000000000", title:"title1", price:1000},
                    {isbn:"000000000001", title:"title2", price:undefined}
                ]
            },
            {
                code:00000000,name:"name1",books:[
                    {isbn:"000000000000", title:"title1", price:1000},
                    {isbn:"000000000001", title:"title2", price:undefined}
                ]
            }
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
            else if(this.buf_price!=undefined)this.buf_price = this.buf_price*10+x;
            else this.buf_price = x;
        },
        deleteBook:function(x){
            if(this.state!=1)return alert("購入取り消しはできません。現在の操作を完了してください。")
            this.cancelList.push(this.bookList.splice(x,1)[0]);
        },
        makeSum:function(){
            if(this.state!=1)return alert("購入処理を進められません。現在の操作を完了してください。")
            if(isNaN(this.priceSum))return alert("購入処理を進められません。全ての書籍の金額を設定してください。")
            this.display_priceSum = this.priceSum;
            this.state=2;
        },
        backState:function(){
            if(this.state==0){
                this.editting=-1;
                this.buf_price=undefined;
                this.state=1;
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
        },
        nextState:function(){
            if(this.state!=2)return alert("購入処理を進められません。現在の操作を完了してください。")
            this.state=3;
        },
        confirmPurchase:function(){
            if(this.state!=4)return alert("購入処理を進められません。現在の操作を完了してください。")
            alert("ありがとうございました");
            this.display_priceSum = undefined;
            this.display_payment = undefined;
            this.buf_price=undefined;
            this.display_change = undefined;
            this.cancelList = new Array();
            this.bookList = new Array();
            this.state=1;
        }
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
                width:(this.windowWidth*0.6-5)+"px",
                height:(this.windowHeight*0.4-5)+"px",
                transform:buf,
            }
        },
        style_keyboard:function(){
            return {
                width:(this.windowWidth*0.6-5)+"px",
                height:(this.windowHeight*0.4-5)+"px",
            }
        },
        style_books:function(){
            return {
                width:(this.windowWidth-10)+"px",
                height:(this.windowHeight*0.5)+"px",
            }
        },
        style_process:function(){
            return {
                width:(this.windowWidth*0.4-5)+"px",
                height:(this.windowHeight*0.4-5)+"px",
            }
        },
        style_buttons:function(){
            return {
                width:(this.windowWidth*0.4-5)+"px",
                height:(this.windowHeight*0.25-5)+"px",
            }
        },
        priceSum:function(){
            var buf = 0;
            for(var i in this.bookList){
                buf += this.bookList[i].price;
            }
            return buf
        }
    }
});
console.log({"-1":"予約",0:"金額変更",1:"ISBN入力画面",2:"合計確認",3:"購入確定",4:"購入処理中"});
app.windowWidth = window.innerWidth;
app.windowHeight = window.innerHeight;
onresize=function(){
    app.windowWidth = window.innerWidth;
    app.windowHeight = window.innerHeight;
}