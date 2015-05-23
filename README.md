# vestigestory.com

This is the official website of Vestige. This project is a static, database-less, blog-aware site that uses the [Jekyll](http://jekyllrb.com) generator and streamlined by [Gulp](http://gulpjs.com). Ensure that you have the right dependencies installed and set up prior to making modifications.

## Dependencies

- [```node```](https://nodejs.org) 
- [```bundler```](http://bundler.io)

## Usage

Install required gems:
```
$ bundle install
```

Install required node modules:
```
$ node install
```

Test dev environment:
```
$ gulp --debug --serve
```

Test prod environment:
```
$ gulp --serve
```

## Tasks

```gulp --debug```: Builds all source files in the ```app``` directory but skips all compression tasks.

```gulp```: Builds all source fies in the ```app``` directory with asset compression such as CSS/HTML/JavaScript minification and deploys them to the ```public``` directory.

```gulp serve --debug```: Serves the project to ```http://localhost:9000``` by default in debug configuration (recommended for development).

```gulp serve```: Serves the project to ```http://localhost:9000``` by default in production configuration (not recommended for development).

See ```gulpfile.js``` for more tasks and custom flags such as ```--skip-uglify```, ```--skip-csso```, etc.

### Cloud Setup (Heroku)

1. Create new app.

2. Add the following [Heroku buildpacks](https://devcenter.heroku.com/articles/buildpacks) (order matters):

  - Ruby: [https://github.com/heroku/heroku-buildpack-ruby](https://github.com/heroku/heroku-buildpack-ruby)
  - Node.js: [https://github.com/heroku/heroku-buildpack-nodejs](https://github.com/heroku/heroku-buildpack-nodejs)
  
3. Allow the Node.js buildpack to install ```devDependencies```:
  ```
  $ heroku config:set NPM_CONFIG_PRODUCTION=false
  ```
  
4. Push to Heroku (or link to GitHub for automatic deploy):
  ```
  $ git push heroku master
  ```
  If order of buildpacks is set up correctly, the Ruby buildpack should act first to install gem dependencies (namely [Jekyll](http://jekyllrb.com)), then the Node.js buildpack which will install all dependencies defined in ```package.json``` and run the ```postinstall``` script on complete. The ```postinstall``` script kickstarts a ```gulp``` build.
  
5. When ```gulp``` is done, ```npm start``` will kickoff the ```start``` script in ```package.json```, which will do:
  ```
  $ node server.js
  ```
  This will serve the ```public``` directory in the port provided by Heroku or ```9000``` otherwise.

## Deploying

Currently ```vestigestory.com``` is hosted in Heroku, with two app instances: ```vestigestory-com``` and ```vestigestory-com-stage```, where one is the production environment (live) and one is the staging environment, respectively. 

The production environment ```vestigestory-com``` is linked to GitHub with automatic deploy **disabled**. It is also configured to execute the ```gulp``` build task in production, thus undergoing a series of asset compression steps. It is not recommended to overload this environment during development. Test your changes in the staging app instead, and when ready, manually deploy to Heroku.

The staging environment ```vestigestory-com-stage``` is for development use only. It is linked to GitHub as well with automatic deploy **enabled**. Thus every push to GitHub will consequently kickoff a deploy to this instance. Its ```gulp``` build task is also configured to run in debug. This is the best environment to test your changes before deploying them to production. Note that this instance is using Heroku's free tier service, meaning that it only has 1 dyno instance that sleeps after 30 minutes of inactivity.

## Blogging

For a user-friendly interface, use [prose.io](http://prose.io) to add/modify/remove blog posts as well as uploading required images. Note that in [prose.io](http://prose.io), any file/directory that is irrelevant to blogging will be hidden from the UI for security reasons.
