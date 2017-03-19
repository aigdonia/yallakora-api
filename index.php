<?php

require_once "vendor/autoload.php";
$conf = require 'config.php';
date_default_timezone_set('Africa/Cairo');

$app = new \SlimRest\App($conf);

// Attach Middlewares
$app->attachMiddleWare(new \Tuupola\Middleware\Cors([
  "origin" => ["*"],
  "methods" => ["GET", "POST", "PUT", "PATCH", "DELETE"],
  "headers.allow" => [
    "Content-Type", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
  // "cache" => 86400,
  "error" => function ($request, $response, $arguments) {
        $data["status"] = "error";
        $data["message"] = $arguments["message"];
        return $response
            ->withHeader("Content-Type", "application/json")
            ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    }
]));

// Register Entity Resource
// init resources
new \SlimRest\Resource\Ping($app);
new \SlimRest\Resource\Channels($app);
new \SlimRest\Resource\Streams($app);
new \SlimRest\Resource\Servers($app);
new \SlimRest\Resource\Lookups($app);
// end init resources

$app->run();
