# Font Icon Creator

## URL

https://favicon-text-creator.web.app/

## Detail

フォントのアイコン作成ツールです。
テキスト、背景色のカラーピッカーはreact-colorを使用しています。
font-familyは選択ができ、Google fontを使用しています。
フォーマットはjpg,png,svg,webpでダウンロードができます。
svgのフォントはpathではなく、テキストになっています。
画像サイズはアイコン、favicon想定なのでアスペクト比1:1の16進数サイズにしています。
ダウンロードしたファイル名はicon-入力したフォントになります。

## Stack 

* React

## Requirement

"react": "^18.2.0",

## Usage

各設定を完了したらDOWNLOADボタンを押してPCにダウンロードされます。

## Feature Plan

* コメント機能つけてコメントがついたらslackに通知設定
* Google fontの呼び出し方について
* ある程度のセキュリティ対策はしてるが、完全にする必要があるならば改善。
* サーバー側での画像最適化機能
* リファクタリングと細かいところの理解