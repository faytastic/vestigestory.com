# vestigestory.com

This is the official website of Vestige. This project is a static, database-less, blog-aware site that uses the [Jekyll](http://jekyllrb.com) generator and pipelined by [Gulp](http://gulpjs.com).

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

## Deploying

Currently ```vestigestory.com``` is hosted on Heroku, with 3 app instances: ```vestigestory-com```, ```vestigestory-com-stage```, and ```vestigestory-com-dev```, representing the production (live), staging, and development environments respectively. 

The production environment ```vestigestory-com``` is linked to the core GitHub repo with automatic deploy **disabled**. It also configured to execute the ```gulp``` build task in production, thus undergoing a series of asset compression steps. It is not recommended to overload this environment during development. Test your changes in the stage/dev instances instead, and when ready, manually deploy to this instance.

The staging environment ```vestigestory-com-stage``` is for development use only. It is linked to the core GitHub repo with automatic deploy **enabled**. Thus every push to GitHub will consequently kickoff a deploy to this instance. Its ```gulp``` build task is also configured to run in production. This is the best environment to test your changes before deploying them to production since it resembles the production instance the most. Note that this instance is using Heroku's free tier service, meaning that it only has 1 dyno instance that sleeps after 30 minutes of inactivity.

The stage environment ```vestigestory-com-dev``` is for development use only. It is linked to the core GitHub repo with automatic deploy **enabled**. Its ```gulp``` build task is configured to run in debug, so use this instance to test changes quicker. Note that this instance is using Heroku's free tier service, meaning that it only has 1 dyno instance that sleeps after 30 minutes of inactivity.

## Blogging

For a user-friendly UI, use [prose.io](http://prose.io) to add/modify/remove blog posts as well as uploading required images. Note that in [prose.io](http://prose.io), any file/directory that is irrelevant to blogging will be hidden from the UI for security reasons.

Please assume the following conventions:

1. All images used for blog posts should reside ```app/assets/images/journal```, grouped by the post's year and month respectively. For example, if you were to upload an image ```picture.jpg``` for a post dated June 2015, its path would be: ```app/assets/images/journal/2015/06/picture.jpg```. In ```prose.io```, the default image path ```app/assets/images/journal``` is automatically set for you when you comfirm your image upload. Please manually insert the year and the month to the path prior to confirming the upload.

