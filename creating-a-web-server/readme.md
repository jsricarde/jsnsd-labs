## Fastify


Fastify is an up-and-coming framework in the Node.js ecosystem. It's specifically geared towards creating RESTful JSON services but can also be used for serving HTML as in our example implementation in the previous two sections.

Instead of middleware, Fastify supports a plugin-based pattern which provides full code isolation and encapsulation. We'll explore this more in this section.

Fastify explicitly supports newer language features (such as async/await), has a focus on modern developer experience and is the most performant framework in the Node.js ecosystem. Not only that but Fastify also provides full Express integration via the `fastify-express` plugin. This means that the vast Express ecosystem can be used with Fastify (often at higher requests per second), and entire Express projects can be encapsulated in a Fastify plugin and used as part of a Fastify project.

In this section, however, we'll implement the same server created in the previous two sections but with Fastify. Let's start by making a folder:

```sh
node -e "fs.mkdirSync('fastify-web-server')"
cd fastify-web-server
```

Now, we can run the following command to bootstrap a Fastify project:

```sh
npm init fastify
```

It's important to ensure that this command is executed within the `fastify-web-server` folder otherwise files will be added to unintended locations.

This command should produce output similar to the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-1.png" width="1000" />
  <br />
</p>

As we can see from the output, the npm init fastify command creates some files in the current working directory. The following files and folders are generated:

- `.gitignore`
- `package.json`
- `app.js`
- `plugins/README.md`
- `test/helper.js`
- `routes/README.md`
- `plugins/support.js`
- `routes/root.js`
- `test/routes/example.test.js`
- `test/plugins/support.test.js`
- `routes/example/index.js`
- `test/routes/root.test.js`

We'll only need to edit the `app.js`, `routes/root.js` and `routes/example/index.js` files to create the same implementation as in the previous two sections.

Before doing anything else, let's make sure that the project dependencies are installed. In the same folder, let's run the following command:

```sh
npm i
```

While that's running, let's take a look at the contents of the `app.js` file (any comments have been stripped):

```sh
'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = async function (fastify, opts) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
```

The `app.js` file is the entry-point for the project and exports an async function. A Fastify plugin is a function that accepts a server instance and options as parameters. It may accept a third parameter, a next callback or it may return a promise (which is what an async function does). So the `app.js` file is actually exporting a Fastify plugin.

The server instance that is passed as the first argument to this function is named `fastify`. Additional plugins are registered with the registered method. In this case, a single plugin is registered twice. The `fastify-autoload` plugin automatically loads folders of plugins, so all app.js is doing is setting up a convenient way for us to define and work with plugins and routes. In both cases where `fastify.register` is called, the `fastify-autoload` plugin (AutoLoad) is passed as the first parameter and an object is passed as the second parameter. This second parameter is the options for the AutoLoad plugin. The dir option in each case points the `fastify-autoload` plugin to a plugins folder and a routes folder. The options option in each case specifies options that would be passed to all plugins that are autoloaded. It's essentially shallow merging the options passed to the `app.js` plugin function with an empty object

The `package.json` added by the `npm init fastify` command should look something like the following:

```sh
{
  "name": "fastify-web-server",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "directories": {
    "test": "test"
  },
  "scripts": {
    "test": "tap test/**/*.test.js",
    "start": "fastify start -l info app.js",
    "dev": "fastify start -w -l info -P app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "fastify": "^3.0.0",
    "fastify-plugin": "^2.0.0",
    "fastify-autoload": "^3.0.2",
    "fastify-cli": "^2.0.1"
  },
  "devDependencies": {
    "tap": "^14.0.0"
  }
}
```

In the scripts field of the package.json we can see a start field and a dev field. In each case the app.js file is booted with the fastify start command. This works because the fastify-cli dependency (which can be seen in the dependencies field of the package.json) provides a CLI named fastify which is accessible to npm when running package.json scripts. The fastify start command automatically starts the server (performing the same role as the bin/www file in the Express example). Notice we have no defined port, this is because fastify start defaults to port 3000, it could be configured with the -p flag (lowercase) if desired.

In the dev script there are two additional flags: -w and -P (uppercase). The -P flag means "prettify the log output", which would otherwise be newline delimited JSON logs. The -w flag means “watch and reload the project as we work on it”, so we can go ahead and run the following to start our server:

```sh
npm run dev
```

This should display something like the following:


<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-2.png" width="1000" />
  <br />
</p>

We shouldn't need to start and stop the server as we make changes, that will happen automatically.

We can check the server is running correctly by navigating to http://localhost:3000 in the browser. We should see something like the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-3.png" width="1000" />
  <br />
</p>

In Fastify, everything is a plugin. The distinction between plugins and routes is mostly convention-setting to help us reason about a server or service's functionality. The files in the routes folder are actually plugins (exported functions that return promises or use a next callback). The files in the plugins folder are also plugins, but they are more commonly de-encapsulated plugins, meaning that the functionality that they provide can be accessed by sibling plugins. Think of the plugins folder like a lib folder, but where a strict and enforceable common interface is used for every exported piece of functionality. Use of the plugins folder will be explored more in later sections. The entry point is a plugin. Routes are plugins. Plugins (local libraries) are plugins.

A key difference between Express middleware and Fastify plugins is that Express middleware is executed for every request (if reachable) but Fastify plugins are called only at initialization time. Fastify plugins are always asynchronous (either with a callback or a returned promise) to allow for asynchronous initialization of every plugin.

Now, let's focus on the `routes` folder. We just saw that the root route (/) responds with `{"root":true}`. Let's take a look at the code in `routes/root.js`:

```sh
'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })
}
```

The `routes/root.js` file exports an async function that accepts the fastify instance and an options argument. The `routes/root.js` file exports a Fastify plugin. A Fastify plugin is a function that takes the server instance (`fastify`).

Within the plugin function, `fastify.get` is called. This registers an HTTP GET route. The first argument is a string containing a forward slash (/), indicating that the route being registered is the root route (/). All HTTP verbs can be called as methods on the fastify instance (e.g. `fastify.post`, `fastify.put` and so on).

The second argument passed to `fastify.get` is an `async` function, the route handler, which accepts the `request` and `reply` objects. The `request` and `reply` objects have the same objective as the http and Express req and res objects but they have a different (and separate API). To learn more see the "Fastify: Request" and "Fastify: Reply" sections on GitHub

Creating a Web Server with Fastify (Cont.)
A key difference between Express middleware and Fastify plugins is that Express middleware is executed for every request (if reachable) but Fastify plugins are called only at initialization time. Fastify plugins are always asynchronous (either with a callback or a returned promise) to allow for asynchronous initialization of every plugin.

Now, let's focus on the routes folder. We just saw that the root route (/) responds with {"root":true}. Let's take a look at the code in routes/root.js:

```sh
'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })
}
```
The routes/root.js file exports an async function that accepts the fastify instance and an options argument. The routes/root.js file exports a Fastify plugin. A Fastify plugin is a function that takes the server instance (fastify).

Within the plugin function, fastify.get is called. This registers an HTTP GET route. The first argument is a string containing a forward slash (/), indicating that the route being registered is the root route (/). All HTTP verbs can be called as methods on the fastify instance (e.g. fastify.post, fastify.put and so on).

The second argument passed to fastify.get is an async function, the route handler, which accepts the request and reply objects. The request and reply objects have the same objective as the http and Express req and res objects but they have a different (and separate API). To learn more see the "Fastify: Request" and "Fastify: Reply" sections on GitHub.

The `fastify.get` method can accept a normal synchronous function or an `async` function. Whatever is returned from the function or `async` function is automatically processed and sent as the content of the `HTTP` response.

Alternatively the `reply.send` method can be used (e.g. `reply.send({root: true})`), which is similar to the res.send method of Express. This can be useful when working with nested callback APIs.

Since an object is returned, Fastify converts it to a JSON payload before sending it as a response.

Let's edit the `routes/root.js` file to the following:

```sh
'use strict'

const root = `<html>
<head>
  <style>
   body { background: #333; margin: 1.25rem }
   a { color: yellow; font-size: 2rem; font-family: sans-serif }
  </style>
</head>
<body>
  <a href='/hello'>Hello</a>
</body>
</html>
`
module.exports = async function (fastify, opts) {
    fastify.get('/', async function (request, reply) {
        reply.type('text/html')
        return root
    })
}
```

We've added the now familiar `root` string of HTML as a constant to the `routes/root.js` file and then we return root from the async function passed to fastify.get instead of returning an object. We've also used the Fastify API method `reply.type` to set the Content-Type header to `text/html`.

If we now navigate in the browser to http://localhost:3000 we should see the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-4.png" width="1000" />
  <br />
</p>


The other defined route is in routes/example/index.js, let's see what that looks like:

```sh
'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return 'this is an example'
  })
}
```

This code is very similar to the original `routes/root.js` route. Again, we have an exported async function that accepts the server instance (fastify) and options (opts). And again fastify.get is used to register a route, where the second parameter is an async function that is passed request and reply objects representing the incoming request and the outgoing response. However notice that the defined route, the first argument passed to fastify.get, is also / (not /example).

Let's navigate to http://localhost:3000/example in the browser:

<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-5.png" width="1000" />
  <br />
</p>

When a route is defined in a subfolder, by default, the fastify-autoload plugin will register that route prefixed with the name of the subfolder. So the example route is at routes/examples/index.js and registers a route at /. This causes fastify-autoload to register the server route at /example. If the route passed to fastify.get in routes/example/index.js had been /foo then fastify-autoload would have registered that route at /example/foo.

We need a /hello route, so let's rename the routes/example folder to routes/hello. Leaving the npm run dev command running, use another terminal with the working directory set to our fastify-web-server folder to run the following:

```sh
cd routes
node -e "fs.renameSync('example', 'hello')"
cd ..
```

Attempting to load http://localhost:3000/example in the browser will now result in the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-6.png" width="1000" />
  <br />
</p>

This is the default Fastify 404 handling behavior. We'll modify this later to align with our server implementations, but for now we can see that the `/example` route is no more.

However, if we navigate to http://localhost:3000/hello, we should see the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-7.png" width="1000" />
  <br />
</p>

Now, let's modify `routes/hello/index.js` to contain the following code:

```sh
'use strict'

const hello = `<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    reply.type('text/html')
    return hello
  })
}
```

Again, we see the familiar hello constant, which is returned from the route handler function passed as the second argument to fastify.get. At this point we can see that the code is somewhat repetitive. This is a good thing, Fastify is providing a strong declarative structure allowing us to focus on what we actually want to do instead of how to do it.

If we now navigate to http://localhost:3000/hello we should see the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnsd-labs/raw/master/creating-a-web-sever/imgs/server-8.png" width="1000" />
  <br />
</p>


Finally to fully align this implementation with the http and Express implementations we need to modify the Not Found and Method Not Allowed behavior by making our app.js file look as follows (comments have been stripped):

