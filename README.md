Hesperides-gui
========

Hesperides is an open source tool with a front part (hesperides-gui) and a back part (hesperides).

It lets you easily generate content from a template file (using mustache) in a given environment.

See the [Release Notes](RELEASE.md) for the latest version information.

Go to https://github.com/voyages-sncf-technologies/hesperides to handle hesperides back.

Build:
=====

Requirements : npm

```shell
$ npm install
```

Run:
=====

Install grunt-cli :
```shell
$ npm install grunt-cli -g
```

Run the server :
```shell
$ npm start
```

It should launch a server available at http://localhost:80 using back on http://localhost:8080

Tests:
=====

Run the webdriver-manager :
```shell
$ npm run webdriver-start
```

Run the protractor tests in other window :
```shell
$ npm run protractor
```
