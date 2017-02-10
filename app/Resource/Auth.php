<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;

class Auth extends Resource{

	public function routes(){
		$this->get('/onboard', [$this, 'onboard']);
		$this->post('/login', [$this, 'postLogin']);
	}

	public function onboard($req, $res, $args){
    $params = $req->getQueryParams();
		return $this->respond($res, $params);
	}

	public function postLogin($req, $res, $args){
		return $this->respond($res, ['state' => false]);
	}

}
