// This is a JavaScript file

var ncmbController = {
  APPLICATION_KEY:appKey,
   CLIENT_KEY:clientKey,
  //APPLICATION_KEY:"58c7da728493564e84d8f3f23056cafe76bf17339e2e3c49871c3e538e464f70",
 // CLIENT_KEY:"3463e46fe7f23fcd977033e8c6c61bb647f9757775df1f01643a67b6c3691f31",

  ncmb:null,
  currentUser:null,
  screenSize:null,
  sendScore: function(score) {
    var self = this;

    // [1]Score（クラス）を生成
    var Score = self.ncmb.DataStore("ScoreClass");

    // [2]インスタンス生成、スコア数値をフィールド名"score"にセット
    var scoreData = new Score({score: score});

    // [3]送信処理
    scoreData.save()
        .then(function (saved) {
          // 順位を求める
// ”score” フィールドの値が score より大きいものを取得
Score.greaterThan("score", score)
    .count()    // 件数を結果に含める
    .fetchAll()
    .then(function(scores){
        // countの結果は、取得データscoresのcountプロパティに含まれる

        // 0件のとき正しく動作するように条件分岐
        var rank = (scores.count !== undefined) ? parseInt(scores.count) + 1 : 1;

        // ダイアログの表示
        if(typeof navigator.notification !== 'undefined'){
            navigator.notification.alert(
                "今回の順位は #" + rank + " でした！",
                function(){},
                "スコア送信完了！"
                );
        } else {
            alert("スコア送信完了！\n今回の順位は #" + rank + " でした！");
        }
    })
        })
       .catch(function(err){
            console.log(err);
        });
},
// ユーザー登録
createUser: function() {
    var self = this;

    //適当なUUIDを作成
    var uuid = self.uuid();

    //ユーザークラスのインスタンスを作成
    //userNameとパスワードにはuuidを設定
    var user = new self.ncmb.User({userName:uuid, password:uuid});

    //会員登録を行うメソッドを実行
    user.signUpByAccount()
        .then(function(user){
            // 登録完了後ログイン
            localStorage.setItem("userName", uuid);
            alert("ユーザー登録に成功しました！");
        })
        .catch(function(err){
            // userName が被った場合はエラーが返る
            alert("ユーザー登録に失敗しました");
        });
},
  uuid: function() {
    var uuid ="", i, random;
    for(i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
    if(i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "_"
    }
    uuid += (i == 12?4:(i == 16 ? (random & 3 | 8): random)).toString(16);
    }
    return uuid;
  },
  // UUIDが存在すればログイン、しなければ新規作成
loginWithUUID: function() {
    var self = this;
    var userName = localStorage.getItem("userName");

    if(!userName){
        // ユーザーを作成したことがない
        self.createUser();
    } else if(!self.currentUser) {
        // ログアウト状態：userNameとパスワードでログイン
        // 今回はパスワード（第2引数）もuserNameを使用
        self.ncmb.User.login(userName, userName)
            .then(function(user){
                // ログイン後：ユーザーデータの更新
                self.currentUser = user;
                self.refreshCurrentUser();
            })
            .catch(function(err){
                // 失敗した場合：ユーザー作成
                console.log(err);
                self.createUser();
                //会員登録を行うメソッドを実行
user.signUpByAccount()
    .then(function(user){
        // 登録完了後ログイン
        localStorage.setItem("userName", uuid);
        self.loginWithUUID();
    })
            });
    } else {
        // ログアウトしていない（前のログインデータが残っている）
        self.currentUser = self.ncmb.User.getCurrentUser();

        // userオブジェクトを使用してログイン
        self.ncmb.User.login(self.currentUser)
            .then(function(user){
                // ログイン後：ユーザーデータの更新
                self.currentUser = user;
                self.refreshCurrentUser();
            })
            .catch(function(err){
                // セッション切れの場合はログアウトして再ログイン
                console.log(err);

                self.ncmb.User.logout();  // ログアウト
                self.currentUser = null;
                self.loginWithUUID();       // 再ログイン
            });
    }
},
// currentUserプロパティを更新
refreshCurrentUser: function() {
    var self = this;
    if(!self.currentUser) return;

    // オブジェクトIDを用いてユーザーを検索（fetchById）
    self.ncmb.User.fetchById(self.currentUser.get("objectId"))
             .then(function(user){
                 self.currentUser = user;
              })
             .catch(function(err){
                console.log(err);
                self.currentUser = null;
              });
              user.signUpByAccount()

},
// ユーザー名登録フォームの表示
showDisplayNameDialog: function() {
    var self = this;

    $("#mask").show();
    // ダイアログを左右中央に表示する
    $("#userEditWrapper").css("top", self.screenSize.height / 2 - 100);
    $("#userEditWrapper").css("left", self.screenSize.width * 0.1);
    $("#userEditWrapper").show();
},

// ユーザー名登録
updateDisplayName: function(){
    $("#userEditWrapper").hide();
    $("#mask").hide();

    // 入力した名前をカレントユーザーにセット
    var name = $("#name").val();
    this.currentUser.set("displayName", name);

    // 会員情報の更新
    return this.currentUser.update();
},// ユーザー名登録フォームの表示
showDisplayNameDialog: function() {
    var self = this;

    $("#mask").show();
    // ダイアログを左右中央に表示する
    $("#userEditWrapper").css("top", self.screenSize.height / 2 - 100);
    $("#userEditWrapper").css("left", self.screenSize.width * 0.1);
    $("#userEditWrapper").show();
},
// ユーザー名登録
updateDisplayName: function(){
    $("#userEditWrapper").hide();
    $("#mask").hide();

    // 入力した名前をカレントユーザーにセット
    var name = $("#name").val();
    this.currentUser.set("displayName", name);

    // 会員情報の更新
    return this.currentUser.update();
},
finishGame: function(score){
    var self = this;

    if(!self.currentUser){
        self.loginWithUUID();
    } else if(!self.currentUser.displayName){
        // まだユーザー名を登録していない場合
        self.showDisplayNameDialog();

        $("#submit").on("click", function(){
            self.updateDisplayName()
                .then(function() {
                    self.sendScore(score);
                })
                .catch(function(err) {
                    console.log(err);
                    alert("ユーザー名の登録に失敗しました");
                });
        });
    } else {
        // ユーザー名登録済：スコア送信
        self.sendScore(score);
    }
},
  init:function(screenSize) {
    
    var self = this;
    self.ncmb = new NCMB(self.APPLICATION_KEY,self.CLIENT_KEY);
    self.screenSize;
  }
}
