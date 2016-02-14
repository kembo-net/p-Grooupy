var GrooupyRegExp = /^https:\/\/grooupy\.herokuapp\.com\/?$/;
var GrooupyUrl = "https://grooupy.herokuapp.com";

//ツイートを見ている時のみアイコンを表示
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() { chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: "twitter\\.com\\/\\w+\\/status\\/\\d+" },
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

function addUrlToBoxFunc(url) {
  return function (tab) {
    //Grooupyを開いているタブに対してテキストボックスにURLを追加するスクリプトを実行
    console.log(tab.url)
    console.log(url)
    chrome.tabs.executeScript( tab.id,
      { code: ("var urls_str = document.getElementsByName(\"tweets\")[0].value;\n" +
        "if (urls_str) {\n  if (urls_str.slice(-1) != \"\\n\") {\n" +
        "    urls_str += \"\\n\";\n  }\n" +
        "  urls_str += \"" + url + "\\n\";\n}\n" +
        "else {\n  urls_str = \"" + url + "\\n\";\n}\n" +
        "document.getElementsByName(\"tweets\")[0].value = urls_str;") });
    //↑ここのソースコード地獄めいているのでいつか何とかしたい
  }
}

function addUrlToGrooupy(url) {
  chrome.windows.getCurrent({}, function(current_window) {
    var add_url_func = addUrlToBoxFunc(url);
    var c_window_id = current_window.id
    chrome.tabs.query({currentWindow: true}, function (tabs) {
      var g_tab = tabs.filter( function (t) {
        return t.url && t.url.match(GrooupyRegExp);
      });
      if (g_tab.length == 0) {
        //Grooupyを開いているタブが無ければ新しく作る
        chrome.tabs.create({windowId: c_window_id, url: GrooupyUrl}, add_url_func);
      }
      else {
        //もしもうGrooupyを開いていたらそこにツイートのURLを追加
        chrome.tabs.update(g_tab[0].id, {}, add_url_func);
      }
    });
  });
}

function addThisTabToGrooupy() {
  chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
    //現在のタブのurlを追加
    var tweet_tab = tab[0];
    addUrlToGrooupy(tab[0].url);
  });
}

//アイコンがクリックされた際の動作
chrome.pageAction.onClicked.addListener(addThisTabToGrooupy);

