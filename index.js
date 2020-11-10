const express = require('express');
const app = express();
const port = 5000;
const HTTP = require('http');
const NS = HTTP.createServer(app);
const PATH = require('path');
const PARSER=require('body-parser');


const scopes = ['https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.marketing',
    'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.inventory',
    'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    'https://api.ebay.com/oauth/api_scope/sell.item'
];
function hasprop(o,p) {
 if(!o) return false;
 if(o[p]) return true;
 if(o.hasOwnProperty) return o.hasOwnProperty(p);
 return Object.hasOwnProperty.call(o,p);
}
const _S_okayness = {
 ok: true,
 nochange: true,
 Q: true
};

app.use(PARSER.urlencoded({limit: '400mb',extended:true})).use(PARSER.json({limit: '400mb'}));
app.use(function(req,res,cb) {
 if(!req.EBAY) req.EBAY = {};
 if(!res.EBAY) res.EBAY = {};
 req.EBAY.api_path = (req.originalUrl||req.url||'').replace(/\?.*/,'');
 req.EBAY.base_url=req.protocol+'://'+ req.get('host');
 req.EBAY.peer={};
 req.EBAY.P = function(n) {
  if(hasprop(req.body,n)) return req.body[n];
  if(hasprop(req.query,n)) return req.query[n];
  if(hasprop(req.params,n)) return req.params[n];
  if(hasprop(req.cookies,n)) return req.cookies[n];
  return undefined;
 };
 res.EBAY.answer = function(data,o) {
  var d = JSON.stringify(data);
  res.EBAY.data = (d.length <= 400)?d:null;
  res.json(data);
 };
 cb();
});
app.use(express.static(PATH.join(__dirname,'public')));

NS.listen(port,function(){
 console.log('HTTP server listening on the port %d',port);
});
const EbayAuthToken = require('ebay-oauth-nodejs-client');
let ebayAuthToken = new EbayAuthToken({
 filePath: './ebay-config-sample.json'
});

app.get('/api/ebay/auth',(req,res,cb)=>{
 console.info('authenticating user');
 (async () => {
  //const token = await ebayAuthToken.getApplicationToken('SANDBOX');
  const authUrl = ebayAuthToken.generateUserAuthorizationUrl('SANDBOX', scopes);
  //console.log(authUrl);
  res.redirect(authUrl);
 })();
});
app.post('/api/ebay/usertoken',(req,res,cb)=>{
 console.info('getting token for the user');
 const code=req.EBAY.P('code');
 if(!code) return res.EBAY.answer({_S:'data'});
 (async () => {
  var token = await ebayAuthToken.exchangeCodeForAccessToken('SANDBOX', code);
  console.log('Finally..');
  try {
   token=JSON.parse(token);
   console.log(token);
   if(token.error) return res.EBAY.answer({_S:'error'});
   res.EBAY.answer({_S:'ok', token: token.access_token});
  }
  catch(ex) {
   console.error(ex);
   res.EBAY.answer({_S:'error'});
  }
 })();
});


