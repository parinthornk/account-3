var ObjectID = require('mongodb').ObjectID;
var url = "mongodb+srv://zparinthornk:es7HBYTR@cluster0.nymtjxi.mongodb.net?retryWrites=true&w=majority";
var dbName = "TA";
var mongolConnect = function(cb) {
	(require('mongodb').MongoClient).connect(url, function (err, db) { cb(err, db); });
}
module.exports = {
	fList: function (T, query, cb) {
		mongolConnect((err, db) => {
			if (err) {
				cb(null, err);
			} else {
				(db.db(dbName)).collection(T.name).find(query).toArray(function (err, res) {
					db.close();
					var ar = [];
					for (var i = 0; i < res.length; i++) {
						Object.setPrototypeOf(res[i], T.prototype);
						ar.push(res[i]);
					}
					cb(ar, null);
				});
			}
		});
	},
	fGetById: function (T, objid, cb) {
		mongolConnect((err, db) => {
			if (err) {
				cb(null, err);
			} else {
				var id;
				try {
					id = new ObjectID(objid);
				} catch (error) {
					id = null;
				}
				if (id) {
					(db.db(dbName)).collection(T.name).find({ _id: id }).toArray(function (err, res) {
						db.close();
						var tmp = res[0];
						if (tmp) {
							Object.setPrototypeOf(tmp, T.prototype);
							cb(tmp, err);
						} else {
							cb(null, { error: ("Could not find object id: " + objid) });
						}
					});
				} else {
					db.close();
					cb(null, { error: ("Could not find object ID: " + objid) });
				}
			}
		});
	},
	f_kvm_List: function (T, query, cb) {
		mongolConnect((err, db) => {
			if (err) {
				cb(null, err);
			} else {
				(db.db(dbName)).collection(T.name).find(query).toArray(function (err, res) {
					db.close();
					var ar = [];
					for (var i = 0; i < res.length; i++) {
						Object.setPrototypeOf(res[i], T.prototype);
						ar.push(res[i]);
					}
					cb(ar, null);
				});
			}
		});
	},
	f_kvm_Get: function (T, keyName, cb) {
		mongolConnect((err, db) => {
			if (err) {
				cb(null, err);
			} else {
				if (keyName) {
					(db.db(dbName)).collection(T.name).find({ key: keyName }).toArray(function (err, res) {
						db.close();
						var tmp = res[0];
						if (tmp) {
							Object.setPrototypeOf(tmp, T.prototype);
							cb(tmp, err);
						} else {
							cb(null, { error: ("Could not find keyName: " + keyName) });
						}
					});
				} else {
					db.close();
					cb(null, { error: ("Could not find keyName: " + keyName) });
				}
			}
		});
	},
	f_kvm_Upsert: function (obj, cb) {
		if (obj) {
			mongolConnect((err, db) => {
				if (err) {
					cb(null, err);
				} else {
					(db.db(dbName)).collection(obj.constructor.name).updateOne(
						{ key: obj.key },
						{ $set: { value: obj.value } },
						{ upsert: true }
					);
					cb({ "result": "OK" }, err);
				}
			});
		} else {
			cb(null, { error: "Cannot insert undefined object." });
		}
	},
	f_kvm_Delete: function (T, keyName, cb) {
		if (keyName) {
			mongolConnect((err, db) => {
				if (err) {
					cb(null, err);
				} else {
					(db.db(dbName)).collection(T.name).deleteOne({ key: keyName }, function (err, res) {
						db.close();
						cb(res, err);
					});
				}
			});
		} else {
			cb(null, { error: "Cannot delete undefined object." });
		}
	},
	
	/*
db.collection.updateOne(
    { _id: id },
    { $set: { name: 'name' } },
    { upsert: true }
);
	*/
	
	fInsert: function (obj, cb) {
		if (obj) {
			mongolConnect((err, db) => {
				if (err) {
					cb(null, err);
				} else {
					(db.db(dbName)).collection(obj.constructor.name).insertOne(obj, function (err, res) {
						db.close();
						cb(res, err);
					});
				}
			});
		} else {
			cb(null, { error: "Cannot insert undefined object." });
		}
	},
	fInsertMany: function (arr, cb) {
		if (arr) {
			mongolConnect((err, db) => {
				if (err) {
					cb(null, err);
				} else {
					(db.db(dbName)).collection(arr[0].constructor.name).insertMany(arr, function (err, res) {
						db.close();
						cb(res, err);
					});
				}
			});
		} else {
			cb(null, { error: "Cannot insert undefined array." });
		}
	},
	fUpdate: function (obj, cb) {
		if (obj) {
			mongolConnect((err, db) => {
				if (err) {
					cb(null, err);
				} else {
					(db.db(dbName)).collection(obj.constructor.name).updateOne({ _id: obj._id }, { $set: obj }, function (err, res) {
						db.close();
						cb(res, err);
					});
				}
			});
		} else {
			cb(null, { error: "Cannot update undefined object." });
		}
	},
	fUpdateById: function (objid, obj, cb) {
		if (obj) {
			mongolConnect((err, db) => {
				if (err) {
					cb(null, err);
				} else {
					var id;
					try {
						id = new ObjectID(objid);
					} catch (error) {
						id = null;
					}
					if (id) {
						(db.db(dbName)).collection(obj.constructor.name).updateOne({ _id: id }, { $set: obj }, function (err, res) {
							db.close();
							if (res) {
								if (res.matchedCount == 1) {
									cb(res, err);
								} else {
									cb(null, { error: ("Failed to update object, object ID: " + objid + " does not exist.") });
								}
							} else {
								cb(null, { error: ("Failed to update object, object ID: " + objid + " does not exist.") });
							}
						});
					} else {
						db.close();
						cb(null, { error: ("Failed to update object, object ID: " + objid + " does not exist.") });
					}
				}
			});
		} else {
			cb(null, { error: "Cannot update undefined object." });
		}
	},
	fDelete: function (obj, cb) {
		if (obj) {
			mongolConnect((err, db) => {
				if (err) {
					cb(null, err);
				} else {
					(db.db(dbName)).collection(obj.constructor.name).deleteOne({ _id: obj._id }, function (err, res) {
						db.close();
						cb(res, err);
					});
				}
			});
		} else {
			cb(null, { error: "Cannot delete undefined object." });
		}
	},
	fDeleteById: function (T, objid, cb) {
		mongolConnect((err, db) => {
			if (err) {
				cb(null, err);
			} else {
				var id;
				try {
					id = new ObjectID(objid);
				} catch (error) {
					id = null;
				}
				if (id) {
					(db.db(dbName)).collection(T.name).deleteOne({ _id: id }, function (err, res) {
						db.close();
						if (res) {
							if (res.deletedCount == 1) {
								cb(res, err);
							} else {
								cb(null, { error: ("Failed to delete object, object ID: " + objid + " does not exist.") });
							}
						} else {
							cb(null, { error: ("Failed to delete object, object ID: " + objid + " does not exist.") });
						}
					});
				} else {
					db.close();
					cb(null, { error: ("Failed to delete object, object ID: " + objid + " does not exist.") });
				}
			}
		});
	}
};