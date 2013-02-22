var SWAGGER_METHODS = ['get', 'post', 'put', 'delete'],
    SWAGGER_VERSION = "1.0";


function Resource(path) {
  this.path = path;
  this.apis = {};
}

Resource.prototype.getApi = function(path) {
  if (!(path in this.apis)) {
    this.apis[path] = {
      path: path,
      description: "",
      operations: []
    };
  }
  return this.apis[path];
};

var operationType = function(method) {
  method = method.toUpperCase();

  return function(path, summary, operation) {
    if (!operation) {
      operation = summary;
      summary = "";
    } else {
      operation.summary = summary;
    }
    operation.httpMethod = method;

    var api = this.getApi(path);
    api.operations.push(operation);
  };
};

for (var i = 0; i < SWAGGER_METHODS.length; i++) {
  var m = SWAGGER_METHODS[i];
  Resource.prototype[m] = operationType(m);
}


var swagger = module.exports = {};

swagger.resources = [];

swagger.nicknameCounter = 0;

swagger.configure = function(server, options) {
  options = options || {};

  var discoveryUrl = options.discoveryUrl || "/resources.json",
      self = this;

  this.server = server;
  this.apiVersion = options.version || this.server.version || "0.1";
  this.basePath = options.basePath;

  this.server.get(discoveryUrl, function(req, res, next) {
    var result = self._createResponse(req);
    result.apis = self.resources.map(function(r) { return {path: r.path, description: ""}; });

    res.send(result);
  });
};

swagger.createResource = function (path, options) {
  var resource = new Resource(path),
      self = this;
  for (var name in options) {
      resource[name] = options[name];
  }

  this.server.get(path, function(req, res, next) {
    var result = self._createResponse(req);
    result.resourcePath = path;
    result.apis = Object.keys(resource.apis).map(function(k) { return resource.apis[k]; });
    result.models = resource.models;

    res.send(result);
  });

  return resource;
};

swagger._createResponse = function(req) {
  var basePath = this.basePath || "http://" + req.headers.host;
  return {
    swaggerVersion: SWAGGER_VERSION,
    apiVersion: this.apiVersion,
    basePath: basePath
  };
};

  