<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;

class Ping extends Resource{

	public function routes(){
		$this->get('/ping', [$this, 'ping']);
	}

	public function ping($req, $res, $args){
		return $this->respond($res, ['status' => 'OK!', 'ts' => time()]);
	}

}
