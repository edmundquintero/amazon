var express = require('express'),
    crypto = require('crypto'),
    passport = require('passport'),
    Promise = require('promise'),
    // amazon = require('amazon-product-api');
    amazon = require('apac').OperationHelper;

// var methodOverride = require('method-override');

var app = express();

// include handelbars for templating
var hbs = require('hbs');

// Set static folder
app.use(express.static('static'));

// Set rendering engine
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));

// Start Server
var server = app.listen(3000);

// Routing
app.get('/', function(req, res){


  var items;

 //PASSWORD.TXT HERE

  //  client.execute('BrowseNodeLookup', {
  //   'SearchIndex': 'VideoGames',
  //   'Keywords': ''
  //   // 'ResponseGroup': 'BrowseNodes'
  //   }, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
  //       console.log(err, results);
  //       res.json( results);
  //       // res.render('index', {items: results.ItemSearchResponse.Items[0].Item});
  // });
  
  var resultSet = new APIResultSet();

  // client.execute('ItemSearch', {
  //   'SearchIndex': 'VideoGames',
  //   // 'Keywords': 'ps4',
  //   'BrowseNode': '6427831011', //ps4 > games
  //   // 'ItemPage': '10',
  //   'ResponseGroup': 'ItemAttributes,Offers,Images,BrowseNodes'
  //   }, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
  //       console.log(err, results);
  //       var resultLength = results.ItemSearchResponse.Items[0].Item.length;
        
  //       for( var i = 0; i < resultLength; i++ ){
  //         resultSet.addItem(results.ItemSearchResponse.Items[0].Item[i]);
  //       }

  //       // res.json( results.ItemSearchResponse);
  //       // res.render('index', {items: results.ItemSearchResponse.Items[0].Item});
  //       res.render('index', {items: resultSet.getItems()});
  // });

  startApi = function(page){
    callAmazon(page).then(function(data){
      if( page < resultSet.getTotalPages() ){
        startApi(page+1);
      } else {
        res.render('index', {items: resultSet.getItems()});
      }
    });
  };
  startApi(1);

  function callAmazon(page){
    var promise = new Promise(function(resolve, reject){
      client.execute('ItemSearch', {
        'SearchIndex': 'VideoGames',
        // 'Keywords': 'ps4',
        'BrowseNode': '6427831011', //ps4 > games
        'ItemPage': page,
        'ResponseGroup': 'ItemAttributes,Offers,Images,BrowseNodes'
        }, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
            console.log(err, results, page);
            if(err){
              reject(err);
            } else {

              resultSet.setTotalPages(results.ItemSearchResponse);
              var resultLength = results.ItemSearchResponse.Items[0].Item.length;
              for( var i = 0; i < resultLength; i++ ){
                resultSet.addItem(results.ItemSearchResponse.Items[0].Item[i]);
              }
              resolve(true);
            }
            
      });
    });
    return promise;
      
  }




  // res.render('index');
});

var APIResultSet = function(){
  var self = this;
  self.totalPages = 1;
  self.setTotalPages = setTotalPages;
  self.getTotalPages = getTotalPages;
  self.addItem = addItem;
  self.getItems = getItems;

  var items = [];


  function setTotalPages(searchResponse){
    if( parseInt(searchResponse.Items[0].TotalPages[0], 10) > 10){
      self.totalPages = 10;
      return;
    }
    self.totalPages = searchResponse.Items[0].TotalPages[0];
    return;
  }
  function getTotalPages(){
    return self.totalPages;
  }

  function addItem(item){
    items.push(item);
  }

  function getItems(){
    return items;
  }

};
