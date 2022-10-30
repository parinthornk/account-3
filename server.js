const express = require('express');

const app = express();

app.use(express.json())

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

app.listen(process.env.PORT || 5000);