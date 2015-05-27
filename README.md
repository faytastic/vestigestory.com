# vestigestory.com

This is the official website of Vestige. This project is a static, database-less, blog-aware site that uses the [Jekyll](http://jekyllrb.com) generator and pipelined by [Gulp](http://gulpjs.com). Refer to [generator-vars-jekyll](https://github.com/VARIANTE/generator-vars-jekyll) for more details about the project structure.

## Setup

### Remote

Set up remote Git repositories. The source code is hosted on GitHub, while the app itself lives on Heroku. Heroku is linked to the GitHub repo.

1. Clone this project:
  - ```$ git clone https://github.com/andrewscwei/vestigestory.com.git```

2. ```cd``` into it
  - ```$ cd vestigestory.com```

3. Set up Heroku remotes for all 3 environments: prod, stage and dev.
  - ```$ git remote add prod https://git.heroku.com/vestigestory-com.git```
  - ```$ git remote add stage https://git.heroku.com/vestigestory-com-stage.git```
  - ```$ git remote add dev https://git.heroku.com/vestigestory-com-dev.git```

4. Verify that your remotes are set up correctly by doing: ```$ git remote -v```. You should see the following:
  ```
  dev     https://git.heroku.com/vestigestory-com-dev.git (push)
  dev     https://git.heroku.com/vestigestory-com-dev.git (fetch)
  origin  https://github.com/andrewscwei/vestigestory.com.git (fetch)
  origin  https://github.com/andrewscwei/vestigestory.com.git (push)
  prod    https://git.heroku.com/vestigestory-com.git (push)
  prod    https://git.heroku.com/vestigestory-com.git (fetch)
  stage   https://git.heroku.com/vestigestory-com-stage.git (fetch)
  stage   https://git.heroku.com/vestigestory-com-stage.git (push)
  ```

### Local

Do the following to get the project up and running in your local machine.

1. Get dependencies:
  - Heroku Toolbelt ([https://toolbelt.heroku.com](https://toolbelt.heroku.com))
  - Node ([https://nodejs.org](https://nodejs.org))
  - Bundler ([http://bundler.io](http://bundler.io))
  - Gulp ([http://gulpjs.com](http://gulpjs.com))
    - ensure that Gulp is installed globally: ```$ sudo npm install -g gulp```

2. Install required gems:
  ```
  $ bundle install
  ```

3. Install required node modules:
  ```
  $ npm install
  ```
  After ```npm``` is done installing dependencies, it will trigger its ```postinstall``` script which will run a clean ```gulp``` build for production.

### Cloud (Heroku)

This guideline refers to creating a new Heroku app from scratch.

1. Create new app.

2. Add the following [Heroku buildpacks](https://devcenter.heroku.com/articles/buildpacks) (order matters):
  - Ruby: ```$ heroku buildpacks:add https://github.com/heroku/heroku-buildpack-ruby```
  - Node.js: ```$ heroku buildpacks:add https://github.com/heroku/heroku-buildpack-nodejs```
    
3. Allow the Node.js buildpack to install ```devDependencies```:
  - ```$ heroku config:set NPM_CONFIG_PRODUCTION=false```
  
4. Push to Heroku (or link to GitHub for automatic deploy):
  - ```$ git push heroku master```
  
5. If order of buildpacks is set up correctly, the Ruby buildpack should act first to install gem dependencies (namely [Jekyll](http://jekyllrb.com)), then the Node.js buildpack which will install all dependencies defined in ```package.json``` and run the ```postinstall``` script on complete. The ```postinstall``` script kickstarts a ```gulp``` build.
  
6. When ```gulp``` is done, ```npm start``` will kickoff the ```start``` script in ```package.json```, which will do:
  ```
  $ node server.js
  ```
  This will serve the ```public``` directory in the port provided by Heroku or ```9000``` otherwise.

## Tasks

1. ```gulp --debug```: Builds all source files in the ```app``` directory but skips all compression tasks.

2. ```gulp```: Builds all source fies in the ```app``` directory with asset compression such as CSS/HTML/JavaScript minification and deploys them to the ```public``` directory.

3. ```gulp serve --debug```: Serves the project to ```http://localhost:9000``` by default in debug configuration (recommended for development).

4. ```gulp serve```: Serves the project to ```http://localhost:9000``` by default in production configuration (not recommended for development).

See ```gulpfile.js``` for more tasks and custom flags such as ```--skip-uglify```, ```--skip-csso```, etc.

## Blogging

For a user-friendly UI, use [prose.io](http://prose.io) to add/modify/remove blog posts as well as uploading required images. Note that in [prose.io](http://prose.io), any file/directory that is irrelevant to blogging will be hidden from the UI for security reasons.

Please assume the following conventions:

1. All images used for blog posts should reside ```/app/assets/images/journal/```, grouped by the post's year and month respectively. For example, if you were to upload an image ```picture.jpg``` for a post dated June 2015, its path would be: ```/app/assets/images/journal/2015/06/picture.jpg```. In [prose.io](http://prose.io), the default image path ```/app/assets/images/journal/``` is automatically set for you when you comfirm your image upload. Please manually insert the year and the month to the path prior to confirming the upload.

2. All posts reside in either ```/app/journal/_drafts/``` or ```/app/journal/_posts/```, one for unpublished drafts and one for live posts. Drafts are viewable in the dev Heroku instance ```vestigestory-com-dev``` only. Do preview your posts in the form of drafts first before deploying them to the live site.

## Deploying

There are 3 Heroku instances available for previewing the compiled site, as follows:

1. [```vestigestory-com```](http://vestigestory.com) (prod): This is the instance that serves the live site. What you see here is what users see. This instance links to the [core GitHub repo](https://github.com/andrewscwei/vestigestory.com) with auto deploy **disabled**. You must manually deploy to this instance (for now).

2. [```vestigestory-com-stage```](http://vestigestory-com-stage.herokuapp.com) (stage): This is the instance that serves a replica of the live site. Prior to deploying changes to the live site, they should QA'd here first. All configuration settings in this instance is the same as the prod instance, so its safe to assume that what you see here will be what users see. This instance links to the [core GitHub repo](https://github.com/andrewscwei/vestigestory.com) with auto deploy **enabled**. Any push to the [core repo](https://github.com/andrewscwei/vestigestory.com) will trigger a deploy to this instance.

3. [```vestigestory-com-dev```](http://vestigestory-com-dev.herokuapp.com) (dev): This is the instance that serves the project in debug configuration, meaning that there are no asset compression, whatsoever. During development you should test your changes here for faster build iteration. Bloggers can test their drafts here as well. This instance links to the [core GitHub repo](https://github.com/andrewscwei/vestigestory.com) with auto deploy **enabled**. It also has the config variable ```GULP_CONFIG_DEBUG``` set to ```true``` to notify a ```gulp``` to run in the debug environment. Any push to the [core repo](https://github.com/andrewscwei/vestigestory.com) will trigger a deploy to this instance.

When both stage and dev instances pass the auto build, you can safely deploy to the prod instance in the [Heroku dashboard](https://dashboard.heroku.com/apps/vestigestory-com/deploy/github).
