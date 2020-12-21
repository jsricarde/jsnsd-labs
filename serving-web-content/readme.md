## Serving Static Content with Fastify
In the previous chapter, we created a Fastify server in the Creating a Web Server with Fastify section. In this section, we're going to work on the same code base as we left off in the last chapter.

Currently the `package.json` of our code looks as follows:

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

We need to add a new Fastify plugin that will handle static content for us. Making sure that our current working directory is the fastify-web-server folder we created in the previous chapter let's run the following command:

```sh
npm install --save-dev fastify-static
```

This will automatically update the devDependencies section of our `package.json` to look as follows:

```sh
  "devDependencies": {
    "fastify-static": "^3.1.0",
    "tap": "^14.0.0"
  }
  ```

  We've deliberately installed fastify-static as a development dependency. It's generally bad practice to use Node.js for static file hosting in production. We need to think of this as a local development convenience only in most cases so we're going to apply constraints to ensure this isn't used in production.

The `app.js` file currently looks as follows (any comments are removed):

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

  fastify.setNotFoundHandler((request, reply) => {
    if (request.method !== 'GET') {
      reply.status(405)
      return 'Method Not Allowed\n'
    }
    return 'Not Found\n'
  })

}
```

We need to register and configure `fastify-static` but not in production. Let's make our `app.js` look as follows:

```sh
'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')

const dev = process.env.NODE_ENV !== 'production'

const fastifyStatic = dev && require('fastify-static')

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  if(dev) {
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, 'public')
    })
  }

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

  fastify.setNotFoundHandler((request, reply) => {
    if(request.method === 'GET') {
      reply.status(405)
      return 'Method not allowed'
    }
    return 'Not Found\n'
  })
}
```

It is a typical convention when deploying an application to set an environment variable called NODE_ENV to 'production'. This would be managed by deployment infrastructure and is outside of scope here, other than to acknowledge that it's the convention most often used to determine whether a Node.js process is running in development mode or is deployed to production (or staging). By checking that NODE_ENV is not set to production we assume development mode, which makes our dev constant true.

We conditionally load fastify-static into the process if dev is true. Since fastify-static is a development dependency, if we didn't do this the server would throw on initialization due to an attempt to load a missing dependency.

Within the root plugin (the exported async function of app.js), we also conditionally register fastify-static with the fastify.register method. The first argument passed to fastify.register is the fastify-static plugin (fastifyStatic). The second argument is the options for the plugin. We set the root option to point to a folder named public in our project dir. This instructs fastify-static to only serve files from that folder, and not allow any files above that folder to be accessible.

We'll need to create this public folder next. Making sure that fastify-web-server is our current working directory, let's run the following in the terminal:

```sh
node -e "fs.mkdirSync('public')"
cd public
node -e "fs.openSync('index.html', 'w')"
node -e "fs.openSync('hello.html', 'w')"
cd ..
```

We'll also be replacing our routes with static HTML so let's delete `routes/hello.js` and `routes/root.js`:

```sh
cd routes
node -e "fs.unlinkSync('root.js')"
node -e "fs.rmdirSync('hello', {recursive: true})"
cd ..
```

The project file and folder structure should now be as follows:

- `.gitignore`
- `app.js`
- `public/index.html`
- `public/hello.html`
- `routes/README.md`
- `plugins/README.md`
- `plugins/support.js`
- `test/helper.js`
- `test/routes/example.test.js`
- `test/plugins/support.test.js`
- `test/routes/root.test.js`

Our final step is to add the contents of the `index.html` and `hello.html` files.

The `index.html` file should contain the following content:

```sh
<html>
<head>
  <style>
   body { background: #333; margin: 1.25rem }
   a { color: yellow; font-size: 2rem; font-family: sans-serif }
  </style>
</head>
<body>
  <a hr‌ef='/hello.html'>Hello</a>
</body>
</html>
```

Note that the contents of `index.html` differ from the string of HTML in our root route from the previous section in one key place: the anchor link (<a/>) points to `/hello.html` instead of `/hello`.

The `hello.html` file should contain the following content:

Now we can start our server:

```sh
npm run dev
```

If we navigate in a browser to `ht‌tp://localhost:3000` we should see something like the following:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-1.png" width="1000" />
  <br />
</p>

This root route delivers the same HTML as in the previous chapter, the difference is that `fastify-static` is loading `public/index.html` instead of us defining a route and manually sending the content. If we navigate to ht‌tp://localhost:3000/index.html we'll get the same outcome because the root route (/) is special-cased to load an `index.html` file.

If we click the link we'll navigate to ht‌tp://localhost:3000/hello.html, which should result in something similar to the following:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-2.png" width="1000" />
  <br />
</p>

Note that the path of the URL is /hello.html whereas previously it was /hello. This is because `fastify-static` is loading hello.html from the public folder whereas before we had defined a /hello route which responded with a string of HTML. If we attempt to load `ht‌tp://localhost:3000/hello` we would see our 404 Not Found page:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-3.png" width="1000" />
  <br />
</p>

The fastify-static module also decorates the reply object with sendFile method. We can use this to create a route that manually responds with the contents of hello.html if we wanted to alias /hello.html to /hello.

Let's finish this section off by doing just that. We need to recreate the hello folder in the routes directory with an index.js file. Let's run the following commands to create the desired structure:

```sh
cd routes
node -e "fs.mkdirSync('hello')"
cd hello
node -e "fs.openSync('index.js', 'w')"
cd ..
cd ..
```

Let's write the following code into `routes/hello/index.js`:

```sh
'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('hello.html')
  })
}
```

Adding routes/hello/index.js automatically causes fastify-autoload to mount any routes registered in that file at the /hello URL path. We register a GET / route (which is therefore the /hello route) and we call reply.sendFile('hello.html'). This causes fastify-static to respond to the request with contents of the public/hello.html file. The sendFile method knows to load the hello.html file from the public folder because we configure the root option passed to fastifyStatic in app.js to point to the public folder.

While the primary and original focus of Fastify was for building data services, view rendering capability is available with some set up.
Building off our example Fastify server in the prior section, let's add template rendering for dynamic content generation.

In the terminal, with fastify-web-server as the current working directory let's run the following command in order to install a template engine and Fastify's view rendering plugin:

```sh
npm install point-of-view handlebars
```

Handlebars is one of the template engines that point-of-view supports. See more about Handlebars at ht‌tp://handlebarsjs.com.

Now we can set up and configure view rendering, we need to modify our app.js file to look as follows:

```sh
'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const pointOfView = require('point-of-view')
const handlebars = require('handlebars')

const dev = process.env.NODE_ENV !== 'production'

const fastifyStatic = dev && require('fastify-static')

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  // if(dev) {
  //   fastify.register(fastifyStatic, {
  //     root: path.join(__dirname, 'public')
  //   })
  // }

  fastify.register(pointOfView, {
    engine: { handlebars },
    root: path.join(__dirname, 'views'),
    layout: 'layout.hbs'
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

  fastify.setNotFoundHandler((request, reply) => {
    if(request.method === 'GET') {
      reply.status(405)
      return 'Method not allowed'
    }
    return 'Not Found\n'
  })
}
```

We've removed fastify-static which we introduced in the prior section, and with it the dev constant which we won't need for this case because our server will now be performing on-the-fly dynamic rendering.

We loaded the two modules that we installed and then at the top of the exported async function we use fastify.register to register point-of-view (referenced as pointOfView). In the options object passed to fastify.register we set the engine to handlebars. Note that the engine option expects an option with the key being the name of the engine and the value being the engine library itself. We used a shorthand property { handlebars }, which creates an object with the shape { handlebars: handlebars }. We set the root option to path.join(__dirname, 'views'), we'll be creating a views folder in the project folder shortly. We've also set a layout option assigned to layout.hbs, we're also going to create a layout template in the views folder.

Let's create a views folder by running the following command:

```sh
node -e "fs.mkdirSync('views')"
```

We'll also create three files in the views folder: `index.hbs`, `hello.hbs`, and `layout.hbs`:

```sh
cd views
node -e "fs.openSync('index.hbs', 'w')"
node -e "fs.openSync('hello.hbs', 'w')"
node -e "fs.openSync('layout.hbs', 'w')"
cd ..
```

The views/layout.hbs file should contain the following:

```sh
<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
     a { color: yellow; font-size: 2rem; font-family: sans-serif }
    </style>
  </head>
  <body>
    {{{ body }}}
  </body>
</html>
```

We've mixed the styles together from the index.html and hello.html files we created in the previous section and we interpolate a special template local called body inside of the <body> opening and closing tags. Using three braces to denote an interpolation point is Handlebars syntax that instructs the template engine to conduct raw interpolation. In other words, if the body template local contains HTML syntax the content will not be escaped whereas using two braces would cause HTML syntax to be escaped (for instance < would be escaped to &‌lt;). This should never be used when interpolating (uncleaned) user input into templates but when building a layout we need to inject raw HTML. The body local is created automatically by point-of-view when rendering a view because we specified the layout option.

In views/index.hbs we'll add the following content:

```sh
<a href='/hello'>Hello</a><br>
<a href='/hello?greeting=Ahoy'>Ahoy</a>
```

The views/hello.hbs file should contain the following:

```sh
<h1>{{ greeting }} World</h1>
```

Finally, we need to set up our routes to render our views. Let's create the necessary routes folders and files:

```sh
cd routes
node -e "fs.openSync('root.js', 'w')"
node -e "fs.mkdirSync('hello')"
cd hello
node -e "fs.openSync('index.js', 'w')"
```

The routes/root.js file should contain the following:

```sh
'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.view('index.hbs')
  })
}
```

The point-of-view plugin that we registered in app.js decorated the reply instance with a view method. When we registered point-of-view, we set the root option to the views folder. Therefore, when we pass 'index.hbs' to reply.view it knows to look for index.hbs in the view folder. Similarly, the layout option that we set to 'layout.hbs' indicates to point-of-view that the layout template can be found in views/layout.hbs. So when we use reply.view here point-of-view first renders both the views/index.hbs file and then interpolates the rendered output into views/layout.hbs and sends the final rendered output of both files combined as the response. The return value of the reply.view method must be returned from the async function passed as the route handler so that Fastify knows when the route handler has finished processing the request.

The routes/hello/index.js file should contain the following:

```sh
'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const { greeting = 'Hello '} = request.query
    return reply.view(`hello.hbs`, { greeting })
  })
}
```

The reply.view method can take a second parameter, an object which sets the values of the template locals. Recall that views/hello.hbs contains a greeting template local, we pass an object with a property called greeting and a value defaulting to 'Hello' or else the value of a URL query string key named greeting. For instance, a request to /hello?greeting=Ahoy would result in the greeting constant being set to 'Ahoy' for that request and so the object passed as the second argument to reply.view would contain a property named greeting with a value of 'Ahoy'. This in turn would make reply.view render views/hello.hbs with Ahoy World text instead of Hello World.

For the purposes of understanding we're using a query string key-value and sending it back to the client as content. As discussed, the template engine will automatically clean the input (because we interpolate greeting with just two braces) however always exercise caution when handling user input. If there's another way to achieve a goal without directly reflecting content back to the client that is a more secure approach. See "Cross Site Scripting (XSS)" by OWASP for more information.

Let's try it out. If everything went according to plan we should be able to run the following to successfully start the server:

```sh
npm run dev
```

Once the server has started, we should be able to navigate to http://localhost:3000 and see something similar to the following:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-4.png" width="1000" />
  <br />
</p>

Clicking the Hello link should take us to the following screen:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-5.png" width="1000" />
  <br />
</p>

Going back to http://localhost:3000 and clicking the Ahoy link should display the following:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-6.png" width="1000" />
  <br />
</p>

We've now served dynamic content with Fastify. For more details on the point-of-view plugin see https://github.com/fastify/point-of-view.

## Streaming Content with Fastify

The HTTP specification has a header called Transfer-Encoding which can be set to chunked. This means that chunks of data can be sent over HTTP and in many cases browser-clients can begin parsing immediately. Node.js Streams also allow for chunked reading, processing and writing of data. This affinity between Node.js Streams means we can serve content in a highly efficient way: instead of waiting for the server to prepare and process all data and then sending the response, the client can begin parsing some HTML (or theoretically any structured data) we've sent before the server has even finished preparing it for sending.

For this example we'll be using a package that provides a stream of Hacker News content, called hn-latest-stream.

Let's work in our fastify-web-server folder from where we left off in the "Using Templates with Fastify" section.

```sh
npm install hn-latest-stream
```

Now we'll create a new routes folder called routes/articles and add an index.js file to it:

```sh
cd routes
node -e "fs.mkdirSync('articles')"
cd articles
node -e "fs.openSync('index.js', 'w')"
cd ..
cd ..
```

The contents of routes/articles/index.js should be as follows:

```sh
'use strict'

const hnLatestStream = require('hn-latest-stream')

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const { amount = 10, type = 'html' } = request.query

    if (type === 'html') reply.type('text/html')
    if (type === 'json') reply.type('application/json')
    return hnLatestStream(amount, type)
  })
}
```

The hnLatestStream function accepts two parameters, amount and type and then returns a Node.js Stream. The amount is the number of most recent Hacker News articles we want to load and the type describes whether the stream should send HTML chunks or JSON chunks. In our route handler, we set a default amount of 10 and a default type of `'html'` while also allowing these to be overridden by a query string arguments. Depending on the desired type we also use the reply.type method to set the correct Content-Type HTTP header for the content.

Returning the stream (the result of calling hnLatestStream) from the route handler instructs Fastify to safely pipe the stream to the response. The reply.send method can also be passed a stream and Fastify behaves in the same way - by piping the stream as the HTTP response.

Let's see it in action. First we need to start the server with the following command:

```sh
npm run dev
```

Next we can navigate to ht‌tp://localhost:3000/articles and we should see output similar to but not the same as, the following:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-7.png" width="1000" />
  <br />
</p>

This will load different articles each time and there should be ten articles in total. The hn-latest-stream module uses the Hacker News API to fetch the content. It has to first lookup the latest story IDs and then for each ID it has to make a separate HTTP request to fetch the article and then push either JSON or HTML content to the stream that it returns. As such, it should be easy to observe the content being parsed and rendered by the browser incrementally in that there's a visible delay between each article rendering in the browser. This shows the power of streams in action for long running tasks. The server hasn't retrieved all the data yet, but we can still fill the above-the-fold (the part of the page that's first seen when a page loads) with the latest articles while more articles continue to load on the server, and then sent to the client to be displayed beneath the fold.

Let's try out the query string parameters as well. In the browser let's try navigating to the URL: http://localhost:3000/articles?type=json&amount=250. This will load the JSON data for the latest 250 Hacker News stories. We should again be able to observe short delays between each JSON object being received by the browser. When navigating to this URL we should see something similar to the following, but with different content:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-8.png" width="1000" />
  <br />
</p>

In the next chapter, we'll look at creating JSON services in more detail, this section was more to illustrate how streams can be a useful tool in constrained scenarios and how to use streams with the Fastify framework.

One final note about error handling before wrapping up. Due to Fastify handling the stream for us, any errors in the stream will be handled and propagated. If we disconnect from the Internet and then attempt to access http://localhost:3000/articles, we'll see something like the following:

<p align="center">
  <img src="https://raw.githubusercontent.com/jsricarde/jsnsd-labs/main/serving-web-content/imgs/content-9.png" width="1000" />
  <br />
</p>

We caused an error in the stream, which Fastify then handled and responded to our request with a 500 status code along with information about the error.

In the next and final section, we'll discuss how to use streams with Express, which will require more glue around error handling.

Node.js Streams is a large topic. A chapter is dedicated to streams in the course for the companion certification to Node.js Services Development - the Node.js Application Development (LFW211) course.

