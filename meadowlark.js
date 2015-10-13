function getWeatherData(){
	return {
		locations: [
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)',
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Overcast',
				temp: '55.0 F (12.8 C)',
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Overcast',
				temp: '55.0 F (12.8 C)',
			}			
		],
	};
}

var express = require('express'),
	app = express(),
	handlebars = require('express3-handlebars').create({
		defaultLayout: 'main',
		helpers: {
			section: function(name, options){
				if(!this._sections) this._sections = {};
				this._sections[name] = options.fn(this);
				return null;
			}
		}
	}),
	fortune = require('./lib/fortune'),
	jqupload = require('jquery-file-upload-middleware'),
	credentials = require('./credentials.js');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});
app.use(require('body-parser')());
// res.locals是一个对象,包含用于渲染视图的默认上下文。
app.use(function(req, res, next){
	if(!res.locals.partials)
		res.locals.partials = {};
	res.locals.partials.weather = getWeatherData();
	next();
});
app.use('/upload', function(req, res, next){
	var now =Date.now();
	jqupload.fileHandler({
		uploadDir: function(){
			return __dirname + '/public/uploads' + now;
		},
		uploadUrl: function(){
			return '/uploads/' + now;
		}
	})(req, res, next);
});

app.get('/', function(req, res){
	res.render('home');
});
app.get('/about', function(req, res){
	res.render('about', { 
		fortune: fortune.getFortune(),
		pageTestScript: 'qa/tests-about.js'
	});
});
app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});
app.get('/jquerytest', function(req, res){
	res.render('jquerytest');
});
app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck'
	});
});
app.get('/newsletter', function(req, res){
	res.render('newsletter', {crsf: 'CSRF token goes here'});
});
// app.post('/process', function(req, res){
// 	console.log(req.query.form);
// 	console.log(req.body._crsf);
// 	console.log(req.body.name);
// 	console.log(req.body.email);
// 	res.redirect(303, '/thank-you');
// });
app.post('/process', function(req, res){
	if(req.xhr || req.accepts('json, html') === 'json'){
		res.send({success: true});
	} else {
		res.redirect(303, '/thank-you');
	}
});


app.use(function(req, res){
	res.status(404).render('404');
});	
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500).render('500');
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + ';press Ctrl - C to terminate.');
});