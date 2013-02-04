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
swagger.routeNames = {};
swagger.hiddenPaths = [];

swagger.configure = function(server, options) {
  options = options || {};
  
  var discoveryUrl = options.discoveryUrl || "/resources.json",
      self = this;

  this.server = server;
  this.apiVersion = options.version || this.server.version || "0.1";
  this.basePath = options.basePath;

  this.routeNames[this.basePath] = this.server.get(discoveryUrl, self.discoveryRequest);
};

swagger.discoveryRequest = function(req, res, next) {
  var result = swagger._createResponse(req);
  result.apis = swagger.resources.map(function(r) { return {path: r.path, description: ""}; });

  if (swagger.hiddenPaths.length > 0) {
    for (var i = 0; i < swagger.hiddenPaths.length; i++) {
      for (var j = 0; j < result.apis.length; j++) {
        if (result.apis[j].path == swagger.hiddenPaths[i]) {
          result.apis.splice(j, 1);
          break;
        }
      }
    }
  }

  res.send(result);
  return next();
}

swagger.createResource = function(path) {
  var resource = new Resource(path),
      self = this;
  this.resources.push(resource);

  swagger.routeNames[path] = this.server.get(path, function(req, res, next) {
    var result = self._createResponse(req);
    result.resourcePath = path;
    result.apis = Object.keys(resource.apis).map(function(k) { return resource.apis[k]; });
    result.models = resource.models;

    res.send(result);
    return next();
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

swagger.hidePath = function(path) {
  this.hiddenPaths.push(path);
};
