<?php
	// this returns the configuration to database
	return [
		"database" => [
			"connections" => array(
				"development" => "mysql://playsport:playsport@mysql/playsport?charset=utf8",
				"test" => "mysql://mazaj:mazaj@mysql/mazaj?charset=utf8",
				"primary" => "mysql://mazaj:mazaj@mysql/mazaj?charset=utf8"
			) ,
			"models_dir" => "app/Models"
		]
	];
