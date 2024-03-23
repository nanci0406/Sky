"ui";
 
var DexName = "classes2.dex";
var DexVersionName = "DexVersion.js";


//网络文件
var RemoteHost = "http://www.baidu.com/";
var RemoteDexFilePath = RemoteHost + DexName;
var RemoteVersionFilePath = RemoteHost + DexVersionName;
 
 
var Header = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.25 Safari/537.36 Core/1.70.3754.400 QQBrowser/10.5.4034.400 ",
  },
};
/**
 * 开始运行
 */
function Run() {
  try {
    var checkState = false;
 
    //更新
    threads
      .start(function () {
        checkState = CheckVersion();
      })
      .join();
 
    if (checkState) {
      //加载dex并运行
      runtime.loadDex(LocalDexPath);
      new Packages["classes2"]()();
    }
  } catch (error) {
    toast("检查更新状态失败\n" + error);
    console.warn("Run Error: " + error);
  }
}
 
/**
 * 检查版本
 */
function CheckVersion() {
  var res = true;
  try {
    if (!files.exists(LocalVersionFilePath)) {
      console.log("创建版本文件");
      files.createWithDirs(LocalVersionFilePath);
      /** 默认值 */
      files.write(LocalVersionFilePath, "0.0.0");
    }
 
    var localVersion = files.read(LocalVersionFilePath);
    var remoteVersion = http.get(RemoteVersionFilePath,Header).body.string();
 
    if (localVersion != remoteVersion || !files.exists(LocalDexPath)) {
      console.warn("本地版本: " + localVersion);
      console.warn("远程版本: " + remoteVersion);
      if (DownloadDex()) {
        files.write(LocalVersionFilePath, remoteVersion);
      } else {
        //res = false;
      }
    } else {
      toast("最新版,无需更新");
    }
  } catch (error) {
    console.warn("CheckVersion Error: " + error);
    toast("检查版本发生异常\n" + error);
    //OpenLog();
  }
  return res;
}
 
/**
 * 下载Dex
 */
function DownloadDex() {
  var res = false;
  try {
    console.warn("dex开始更新");
    var res = http.get(RemoteDexFilePath,Header);
    if (Http200(res)) {
      files.writeBytes(LocalDexPath, res.body.bytes());
      if (files.exists(LocalDexPath)) {
        console.warn("dex更新成功");
        toast("更新成功");
        res = true;
      }
    } else {
      console.warn("DownloadDex 下载失败:  " + res);
      toast("DownloadDex 下载失败:  " + res);
      OpenLog();
      threads.shutDownAll();
      sleep(99999);
    }   
  } catch (error) {
    console.warn("DownloadDex Error: " + error);
    toast("下载新的dex 异常.\n" + error);
   // OpenLog();
  }
 
  return res;
}
 
/**
 * 判断是否 不是 空
 * @param {any}} content 内容
 */
function IsNotNullOrEmpty(content) {
  return content != null && content != undefined && Trim(content).length > 0;
}
 
/**
 * http200验证
 * @param {object} content http返回的json
 */
function Http200(content) {
  return (
    IsNotNullOrEmpty(content) &&
    (content.statusCode == 200 || content.statusCode == "200")
  );
}
 
/**
 * 去除左右空格
 * @param {string} content
 */
function Trim(content) {
  return (content + "").replace(/(^\s*)|(\s*$)/g, "");
}
 
function OpenLog() {
  ui.run(function () {
    // app.startActivity("console");
   
  });
}
 
Run();