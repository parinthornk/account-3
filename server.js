const express = require('express');
const DB = require('./DB.js');
const MD = require('./MD.js');

const app = express();

const config = [
	{
		"basePath": "/kvms",
		"idPhrase": "id",
		"objType": "MD.KVM"
	}
];

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

/*for (let cfi = 0; cfi < config.length; cfi++) {
	
	let cf = config[cfi];
	let basePath = cf["basePath"];
	let idPhrase = cf["idPhrase"];
	let objType = eval(cf["objType"]);
	let plural = basePath.replace("/", "");
	
	app.get(basePath, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		DB.fList(objType, {}, (result, err) => {
			if (err) {
				res.status(500);
				res.end(json2string(err));
			} else {
				let js = { "tmp": result };
				js[plural] = js["tmp"];
				delete js["tmp"];
				res.end(json2string(js));
			}
		});
	});

	app.get(basePath + '/:' + idPhrase, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		DB.fGetById(objType, req.params[idPhrase], (result, err) => {
			if (err) {
				res.status(404);
				res.end(json2string(err));
			} else {
				res.end(json2string(result));
			}
		});
	});

	app.post(basePath, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		var obj = req.body;
		delete obj["_id"];
		Object.setPrototypeOf(obj, objType.prototype);
		DB.fInsert(obj, (result, err) => {
			if (err) {
				res.status(400);
				res.end(json2string(err));
			} else {
				res.end(json2string(result));
			}
		});
	});

	app.put(basePath + '/:' + idPhrase, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		var obj = req.body;
		delete obj["_id"];
		Object.setPrototypeOf(obj, objType.prototype);
		DB.fUpdateById(req.params[idPhrase], obj, (result, err) => {
			if (err) {
				res.status(404);
				res.end(json2string(err));
			} else {
				res.end(json2string(result));
			}
		});
	});

	app.delete(basePath + '/:' + idPhrase, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		DB.fDeleteById(objType, req.params[idPhrase], (result, err) => {
			if (err) {
				res.status(404);
				res.end(json2string(err));
			} else {
				res.end(json2string(result));
			}
		});
	});
}*/

app.all('/kvms', kvms);
app.all('/kvms/*', kvms);

// ---------------------------------------------------------------------------------------------------------------- //

app.get('/test-403-good', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Allow', '*');
	res.status(403);
	res.end(json2string({
		"message": '/test-403-good'
	}));
});

app.get('/test-403-bad', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.status(403);
	res.end(json2string({
		"message": '/test-403-bad'
	}));
});

app.get('/test-405-good', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Allow', '*');
	res.status(405);
	res.end(json2string({
		"message": '/test-405-good'
	}));
});

app.get('/test-405-bad', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.status(405);
	res.end(json2string({
		"message": '/test-405-bad'
	}));
});

// ---------------------------------------------------------------------------------------------------------------- //
















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

function kvms(req, res) {
	res.setHeader('Content-Type', 'application/json');
	
	let bodyRaw = "";
	
	if (req.method == "POST") {
		try {
			bodyRaw = String.fromCharCode.apply(null, req.body);
			let obj = JSON.parse(bodyRaw);
			let key = obj["key"];
			let value = obj["value"];
			DB_KVM_ADD(new MD.KVM(key, value), res);
		} catch (err) {
			let s = json2string({"error": err});
			res.status(500);
			res.end(s);
		}
	} else if (req.method == "GET") {
		try {
			let path = req.path;
			let sep = path.split('/');
			if (sep.length == 3 || sep.length == 2) {
				if (sep.length == 3) {
					let keyName = sep[2];
					DB_KVM_GET(keyName, res);
				}
				if (sep.length == 2) {
					DB_KVM_LIST(res);
				}
			} else {
				throw("invalid, sep.length != 3");
			}
		} catch (err) {
			let s = json2string({"error": err});
			res.status(500);
			res.end(s);
		}
	} else if (req.method == "DELETE") {
		try {
			let path = req.path;
			let sep = path.split('/');
			if (sep.length == 3) {
				let keyName = sep[2];
				DB_KVM_DELETE(keyName, res);
			} else {
				throw("invalid, sep.length != 3");
			}
		} catch (err) {
			let s = json2string({"error": err});
			res.status(500);
			res.end(s);
		}
	} else {
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
}

function DB_KVM_ADD(kvm, res) {
	DB.f_kvm_Upsert(kvm, (result, err) => {
		if (err) {
			res.status(500);
			res.end(json2string(err));
		} else {
			res.status(201);
			res.end(json2string(result));
		}
	});
}

function DB_KVM_GET(key, res) {
	DB.f_kvm_Get(MD.KVM, key, (result, err) => {
		if (err) {
			res.status(404);
			res.end(json2string(err));
		} else {
			res.status(200);
			res.end(json2string(result));
		}
	});
}

function DB_KVM_LIST(res) {
	DB.f_kvm_List(MD.KVM, {}, (result, err) => {
		if (err) {
			res.status(500);
			res.end(json2string(err));
		} else {
			res.status(200);
			res.end(json2string(result));
		}
	});
}

function DB_KVM_DELETE(key, res) {
	DB.f_kvm_Delete(MD.KVM, key, (result, err) => {
		if (err) {
			res.status(500);
			res.end(json2string(err));
		} else {
			res.status(200);
			res.end(json2string(result));
		}
	});
}