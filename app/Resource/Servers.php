<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Server as Server;

class Servers extends Resource{

	public function routes(){
    $this->get('/servers', [$this, 'getAllStreamServers']);
    $this->post('/server', [$this, 'createNewServer']);
    $this->put('/server/{server_id}', [$this, 'updateServer']);
    $this->post('/server/{server_id}/remove', [$this, 'deleteServer']);
	}

	public function getAllStreamServers($req, $res, $args){
    $servers = Server::find('all');
    $servers = array_reduce($servers, function($list, $server){
      $list[] = $server->to_array();
      return $list;
    },[]);

    return $this->respond($res, ["servers"=>$servers]);
  }

  public function createNewServer($req, $res, $args){
    $data = $req->getParsedBody();
    $server = new Server();
    $server->name = $data['name'];
    $server->embded_pattern = $data['embded_pattern'];
    try{
    if($server->save())
      return $this->respond($res, ['server' => $server->attributes()]);
    } catch(\ActiveRecord\DatabaseException $e) {
      return $this->respond($res, ['error' => ['msg' => 'unable to create stream server']], 500);
    }
  }

  public function updateServer($req, $res, $args){
    $data = $req->getParsedBody();
    try{
      $server = Server::find($args['server_id']);
      $server->embded_pattern = $data['embded_pattern'];
      $server->save();
      return $this->respond($res, [ 'server' => $server->attributes() ]);
    } catch(\ActiveRecord\DatabaseException $e){
      return $this->respond($res, ['error' => ['msg' => 'unable to update server embded code']], 500);
    } catch(\ActiveRecord\RecordNotFound $e) {
      return $this->respond($res, ['error' => ['msg' => 'Server can\'t be found']], 404);
    }
  }

  public function deleteServer($req, $res, $args){
    $data = $req->getParsedBody();
    try{
      $server = Server::find($args['server_id']);
      $server->delete();
      return $this->respond($res, [ 'server' => $server->attributes() ]);
    } catch(\ActiveRecord\DatabaseException $e){
      return $this->respond($res, ['error' => ['msg' => 'unable to delete server']], 500);
    } catch(\ActiveRecord\RecordNotFound $e) {
      return $this->respond($res, ['error' => ['msg' => 'Server can\'t be found']], 404);
    }
  }
}

 ?>
