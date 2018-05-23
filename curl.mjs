// const unirest = require("unirest");
// const iconv = require('iconv-lite');
// const fs = require('fs')



// var req = unirest("POST", "http://proj1.sinica.edu.tw/~swjz/ftms-bin/scripts/look_for_sym.pl");

// req.headers({
//     "Cache-Control": "no-cache",
//     "Host": "proj1.sinica.edu.tw",
//     "Content-Type": "application/x-www-form-urlencoded",
//     "Accept-Encoding": "gzip , deflate",
//     "Accept-Language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7",
//     "Origin": "http://proj1.sinica.edu.tw",
//     "Connection": "keep-alive",
//     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
//     "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
// });

// req.multipart([{
//     "body": "電腦"
// }]);

// req.end(function (res) {
//     if (res.error) throw new Error(res.error);
//     fs.writeFile('./sss.html', res.body);
//     console.log(res.body);
// });
