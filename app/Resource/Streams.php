<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Stream as Stream;

class Streams extends Resource{

	public function routes(){
    $this->post('/channels/{channel_id}/stream', [$this, 'createNewStream']);
    $this->patch('/streams/sort', [$this, 'sortChannelStreams']);
    $this->put('/streams/{stream_id}', [$this, 'updateStream']);
    $this->post('/streams/{stream_id}', [$this, 'updateStream']);
    $this->post('/streams/{stream_id}/remove', [$this, 'deleteStream']);
	}

	public function createNewStream($req, $res, $args){
    $channel = $args['channel_id'];
    $requestParams = $req->getParsedBody();
    $newStream = new Stream([
      "channel_id" => $channel,
      "title" => $requestParams['title'],
      "quality" => $requestParams['quality']
    ]);

    if(isset($requestParams['server'])){
      $newStream->server_id = $requestParams['server'];
      $newStream->server_channel = $requestParams['channel'];
    } else if(isset($requestParams['url'])){
      $newStream->remote_url = $requestParams['url'];
    } else {
      return $this->respond($res, ["error" => ['msg' => 'Missing parameter send either streaming server configuration or stream url']], 500);
    }

    if($newStream->save()){
      return $this->respond($res, [
        "stream" => $newStream->getDetails()
      ]);
    }
  }

  public function updateStream($req, $res, $args) {
    $stream_id = $args['stream_id'];
    $updateAttrs = $req->getParsedBody();
    $stream = Stream::find($stream_id);

    // update status
    if( isset($updateAttrs['status']) && in_array($updateAttrs['status'], ['idle', 'active']) )
      $stream->status = $updateAttrs['status'];

    // update server_channel
    if( isset($updateAttrs['server_channel']) )
      $stream->server_channel = $updateAttrs['server_channel'];

    // update remote_url
    if( isset($updateAttrs['stream_url']) )
      $stream->stream_url = $updateAttrs['stream_url'];

    $stream->save();
    return $this->respond($res, $stream->getDetails());
  }

  public function deleteStream($req, $res, $args) {
    $stream_id = $args['stream_id'];
    try{
      $stream = Stream::find($stream_id);
      $stream->delete();
      return $this->respond($res, [
        'stream' => $stream->getDetails()
      ]);
    } catch(\ActiveRecord\RecordNotFound $e){
      return $this->respond($res, [
        'error'=>[
          'msg' => 'Stream Not Found'
        ]
      ], 404);
    }
  }

  public function sortChannelStreams($req, $res, $args){
    $streamsOrder = $req->getParsedBody()['streams'];
    $commited = Stream::transaction(function() use ($streamsOrder){
      foreach($streamsOrder as $streamId => $streamOrder){
        $stream = Stream::find($streamId);
        $stream->sort = $streamOrder;
        $f = $stream->save();
        if(!$f)
          return false;
      }
    });
    return $this->respond($res, ['commited' => $commited]);
  }
}

 ?>
