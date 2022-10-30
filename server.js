const express = require('express');

const app = express();

//app.use(express.json());

app.use(
	express.raw({
		inflate: true,
		limit: '50mb',
		type: () => true, // this matches all content types
	})
);

function json2string(json) {
	return JSON.stringify(json, null, "  ");
}

app.get('/hello', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.status(200);
	res.end(json2string({
		"message": "Hello!"
	}));
});

app.all('/echo/*', echo);

app.all('/echo', echo);

app.listen(process.env.PORT || 5000);

function echo(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.status(200);
	res.end(json2string({
		"method": req.method,
		"headers": req.headers,
		"query": req.query,
		"path": req.path,
		"baseUrl": req.baseUrl,
		"originalUrl": req.originalUrl,
		"bodyRaw": String.fromCharCode.apply(null, req.body)
	}));
}