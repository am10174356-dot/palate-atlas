# アカウント同期の有効化手順(Firebase・無料)

アカウント機能(4桁PINログイン・PCとスマホで同じデータベース)を使うには、
無料のFirebaseプロジェクトを一度だけ作成します。所要時間は10分ほどです。

## ① Firebaseプロジェクトを作る

1. [console.firebase.google.com](https://console.firebase.google.com) を開き、Googleアカウントでログイン
2. 「プロジェクトを作成」→ プロジェクト名に `palate-atlas` と入力 → 続行
3. Googleアナリティクスは「無効」でOK → 「プロジェクトを作成」

## ② ログイン機能(Authentication)を有効にする

1. 左メニュー「構築」→「Authentication」→「始める」
2. 「メール / パスワード」を選択 → 「有効にする」をオン → 保存
   ※ アプリ内ではアカウントID+PINを内部的にこの形式へ変換して使います

## ③ データベース(Firestore)を作る

1. 左メニュー「構築」→「Firestore Database」→「データベースを作成」
2. ロケーションは `asia-northeast1`(東京)を選択
3. 「本番環境モードで開始」を選択 → 作成
4. 作成後、「ルール」タブを開き、内容を以下に**全置き換え**して「公開」:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

(これで「自分のデータは自分しか読み書きできない」設定になります)

## ④ アプリにWeb設定を登録する

1. Firebaseコンソール左上の「プロジェクトの概要」横の⚙ →「プロジェクトの設定」
2. 「マイアプリ」→ ウェブアイコン `</>` をクリック → アプリ名 `palate-atlas` で登録
3. 表示される `const firebaseConfig = { ... }` の `{ ... }` 部分をコピー
4. このフォルダの `data/sync-config.js` を開き、`export const FIREBASE_CONFIG = null;` を
   `export const FIREBASE_CONFIG = { コピーした内容 };` に書き換えて保存
   ※ コピーした設定をClaudeに貼り付けてもらえれば、書き換えはこちらで行います

## ⑤ 再デプロイ

GitHub Pagesで公開している場合は、更新した `data/sync-config.js` を
リポジトリに上書きアップロードすれば反映されます。

## 使い方

- 初回: アプリを開くとログイン画面が出るので「新規アカウント作成」でID+4桁PINを登録
- 2台目以降の端末: 同じID+PINで「ログイン」すれば、同じデータベースが同期されます
- 同期はノートの保存・削除時に自動で行われ、アプリを開き直した時にも取り込まれます
- 設定画面から「今すぐ同期」「起動時にPINを要求」の切り替え、ログアウトができます

## 補足(セキュリティ)

- PINは4桁のため、本格的なパスワードほど強固ではありません。テイスティングノートという
  データの性質を踏まえた、利便性優先の設計です(Firebase側で連続試行はブロックされます)
- AIフィードバック用のAPIキーは同期されません(各端末で入力が必要です)
