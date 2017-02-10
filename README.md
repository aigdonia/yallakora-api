# slimrest RESTful API scaffold
## based on slimframework3.0

this project provides scaffold for your next RESTful API.

## Additional Tools

This scaffold mashes additional libraries to get in shape, it uses [PHPActiveRecord ORM](http://www.phpactiverecord.org/) library for database manipulation, and uses [JWT](http://jwt.io/) for authentication/authorization with frontend.

Additional resources and tutorials based on the scaffold will be available here soon.

## Easy to start
 1. download the code or fork it to your github account.
 2. install dependencies by running `./composer.phar install`

 **note** use your own composer install if you already have one
 3. update config.php file to meet your system requirements.
 4. run through your http php-enabled server, for quick starts, run `php -S localhost:9001` from your terminal inside project directory to have quick up and running development instance.

 **tip** Don't use this way in production, deploy in reliable webserver

## Getting Started

### 1. Configure The Database Connection
This scaffold uses [PHPActiveRecord](http://www.phpactiverecord.org/) to handle database connectivity and manipulation, I've PHPActiveRecord for 3 years, and it is really quick awesome solution if you still using the `mysqli` or `PDO`, give it a look.

Configuration is straight in this scaffold, edit your `/config.php` file to add as many connections as you want,

**Note** that the `'development'` connection is **mandatory** to be there unless you set the system environment variable `'LIS_ENV'` to whatever connection name you want.

Connection string is formatted like:

`<DB_DRIVER>://<USER>:<PASS>@<DB_SERVER>/<DB_NAME>`

for example `mysql://root:root@localhost/database`.

`models_dir` configuration key is critical for PHPActiveRecord to find the model classes, it is set by default to `app/Model`.

**Note**  if you are going to change where your models will be, point this location to where you are going to place all your models classes

### 2. Create Your First Route
This scaffold uses the term `Resource` to describe a single Entity or a Module in your system, you are free to divide your system into Resources, each Resource in your system should be included in the directory `Resource` and should extend the abstract class `\SlimRest\Resource`.

Implement the method `routes` in your own Resource subclass by adding your routes.

```php
<?php
	namespace SlimRest\Resource;
	use \SlimRest\Resource as Resource;
	class Auth extends Resource{
	 public function routes(){
		 $this->get('/login', [$this, 'doLogin']);
		 $this->post('/login', [$this, 'postLogin']);
		 ...
	 }

	 public function doLogin($req, $res, $args){
		 ...
		 return $this->respond($res, ... );
	 }

	 public function postLogin($req, $res, $args){
		 ...
	 }
	}

```
### 3. Register Resource in your index file
last thing to do is to register your created resource by creating new instance in `/index.php`
```php
	new \SlimRest\Resource\Auth();
```

Try accessing your routes through web browser or Postman

Tutorials will be available soon here.
