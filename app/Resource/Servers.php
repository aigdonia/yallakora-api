<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Server as Server;

class Servers extends Resource{

	public function routes(){
    $this->get('/servers', [$this, 'getAllStreamServers']);
	}

	public function getAllStreamServers($req, $res, $args){
    $servers = Server::find('all');
    $servers = array_reduce($servers, function($list, $server){
      $list[] = $server->to_array();
      return $list;
    },[]);

    return $this->respond($res, ["servers"=>$servers]);
  }

}

 ?>
