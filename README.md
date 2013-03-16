# swagger-doc

Document your express/restify rest api and expose to swagger ui.

## Getting Started
Install the module with: `npm install swagger-doc`

## Example
```javascript
var restify = require('restify'),
    swagger = require('swagger-doc'),
    server = restify.createServer();


// All configuration is optional. Only server is needed to add swagger routes.
swagger.configure(server, {
	discoveryUrl: "/resources.json",
	version:      "0.1",
	basePath:     "https://api.product.com"
});


// Create a new swagger resource at specified route.
docs = swagger.createResource("/payments");

docs.models.Payment = {...};

// Documents an api, all options are same as in swagger.
docs.get("/payments/{id}", "Gets information about a specific payment", {
	notes: "The information is very sexy.",
	nickname: "getPayment",
	parameters: [
	    {name:"id", description: "Id of payment", required:true, dataType: "string", paramType: "path"}
	]
});

// Another resource
var docs = swagger.createResource("/account", {
    models: {
        Account: {...}
    }
});

// Swagger-doc has express-like api.
docs.post('/account/authenticate', {
    summary: "Authenticates a user"
});

docs.get('/account/user', {
    summary: "Returns the logged in user"
});

docs.delete('/account/user', {
    summary: "Logs out the current user"
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Eirikur Nilsson  
Licensed under the MIT license.
