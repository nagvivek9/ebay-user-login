function intractable() { // eslint-disable-line no-unused-vars
 var _hosturl;
 var _port;
 var L = {
  trace: console.debug, // eslint-disable-line no-console
  warn: console.warn    // eslint-disable-line no-console
 };

 // Initializes the api by calling socket io init
 this.init = function(hosturl,port) {
  _hosturl = hosturl;
  _port = port;
 };

 this.set_logger = function(l) { L = l; return this };

 this.request = function(action, params, cb) {
  var url = _hosturl;
  var wc = false;
  if(params._C) {
   wc = true;
   delete params._C;
  }
  if(_port) url += ":"+_port;
  url += ("/api/"+action);
  var d = '';
  for(var p in params) {
   if(!params.hasOwnProperty(p)) continue;
   if(d.length) d+= '&';
   d+=encodeURIComponent(p)+'='+encodeURIComponent(params[p]);
  }

  var x = new XMLHttpRequest();
  x.open('POST',url);
  x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  if(wc) x.withCredentials = true;

  x.onreadystatechange=function() {
   if(x.readyState===4) {
    if(x.status!=200) {
     L.warn({status:x.status},"HTTP status "+x.status);
     return cb(new Error("HTTP error: "+x.status), null);
    }
    var j;
    try {
     j = JSON.parse(x.responseText);
    }
    catch(error) {
     var temp = "(" + x.responseText + ")";  
     j = eval(temp);
    }
    L.trace({a:action,r:j},"intractable response to "+action+" ("+x.responseText.length+" byte(s))");

    if(j) return cb(null, j);
    return cb(new Error("JSON parse error: "+x.responseText), null);
   }
  };
  L.trace({params:params},"intractable call "+url);
  x.send(d);
 };
}
