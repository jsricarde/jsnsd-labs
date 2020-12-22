## Conventions

When writing a Node.js service it is typical to default to listening on a well-known port (say 3000) while also allowing that port to be overridden with the PORT environment variable. This can be accessed with process.env.PORT and then passed to a servers listen method.

The npm init fastify command which generates a Fastify project uses fastify-cli to start the application, which automatically allows the PORT environment variable to specify the port.

The express command-line executable that's installed by the express-generator module when globally installed generates a bin/www file that similarly allows the port to be specified via a PORT environment variable.

Another frequently occurring convention that is important to the deployment of Node.js services is a standard approach to starting the Node.js process. The standard approach is to have a start field in the scripts object of the package.json file so that the process can be started with npm start. The npm start command will execute the contents of the start field as a shell command.

Another frequently occurring convention that is important to the deployment of Node.js services is a standard approach to starting the Node.js process. The standard approach is to have a start field in the scripts object of the package.json file so that the process can be started with npm start. The npm start command will execute the contents of the start field as a shell command.

For instance in Express the start field would usually be:

```sh
"scripts": {
  "start": "node ./bin/www"
}
```

In Fastify the --integrate flag can be executed in a directory with a package.json file to generate a project and also update the preexisting package.json file:

```sh
npm init fastify --integrate
```

In this case the start field in the scripts object will be updated automatically and all the usual files (such as app.js, the routes folder and so on) will be added into that directory:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/creating-restful-json-services/imgs/json-1.png" width="1000" />
  <br />
</p>

In the following sections we'll be using Fastify and Express to implement a RESTful JSON service.

