<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Channel as Channel;
use \SlimRest\Models\Stream as Stream;

class Channels extends Resource{

	public function routes(){
		$this->get('/channels', [$this, 'listAllChannels']);
    $this->get('/channels/{channel}', [$this, 'getSingleChannel']);
    $this->post('/channels', [$this, 'createNewChannel']);
    $this->delete('/channels/{channel}', [$this, 'deleteSingleChannel']);
	}

	public function listAllChannels($req, $res, $args){
    $channels = Channel::find('all');
    $channels = array_reduce($channels, [$this, 'processChannelsArray'] , []);
    return $this->respond($res, $channels);
	}

  public function getSingleChannel($req, $res, $args){
    $channel = Channel::find($args['channel']);
    return $this->respond($res, [
      "channel" => $args['channel'],
      "data" => $channel->to_array(),
      "streams" => $channel->getStreams('all')
    ]);
  }

  public function createNewChannel($req, $res, $args){
    $newChannelData = $req->getParsedBody();
    $newChannel = new Channel();
    $uid = $newChannelData['uid'];
    if(empty($newChannelData['uid']))
      $uid = str_replace(" ","",strtolower($newChannelData['name']));

    $newChannel->id = $uid;
    $newChannel->name = $newChannelData['name'];
    try{
      if( $newChannel->save() ){
        return $this->respond($res, [
          'channel' => $newChannel->getDetails()
        ]);
      }
    } catch(\ActiveRecord\DatabaseException $e){
      return $this->respond($res, ['msg' => 'Unable to save this channel'], 500);
    }
  }



  function processChannelsArray($processedList, $currentChannel){
    array_push($processedList, $currentChannel->getDetails());
    return $processedList;
  }

}

 ?>
