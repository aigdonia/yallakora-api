<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Channel as Channel;
use \SlimRest\Models\Stream as Stream;

class Channels extends Resource{

	public function routes(){
		$this->get('/channels', [$this, 'listAllChannels']);
    $this->get('/channels/{channel}', [$this, 'getSingleChannel']);
    $this->post('/channels/{channel}/logo', [$this, 'updateChannelLogo']);
    $this->post('/channels', [$this, 'createNewChannel']);
    // $this->delete('/channels/{channel}', [$this, 'deleteSingleChannel']);
    $this->post('/channels/{channel}/remove', [$this, 'deleteSingleChannel']);
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
      "data" => $channel->getDetails(),
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

  public function deleteSingleChannel($req, $res, $args){
    $channel_id = $args['channel'];
    try{
      $channel = Channel::find($channel_id);
      $channel->delete();
      return $this->respond($res, [
        'channel' => $channel->getDetails()
      ]);
    } catch(\ActiveRecord\RecordNotFound $e){
      return $this->respond($res, [
        'error'=>[
          'msg' => 'Channel Not Found'
        ]
      ], 404);
    }
  }

  public function updateChannelLogo($req, $res, $args){
    $channel_id = $args['channel'];
    try {
      $channel = Channel::find($channel_id);
      $logoFile = $req->getUploadedFiles()['file'];
      if ($logoFile && $logoFile->getError() === UPLOAD_ERR_OK) {
        // $uploadFileName = $newfile->getClientFilename();
        // $newfile->moveTo("/path/to/$uploadFileName");
        // move to somewhere on the server
        $filename = 'uploads/logos/'.$channel_id.'.png';
        $logoFile->moveTo($filename);
        $channel->logo = $filename;
        $channel->save();
        // save to database
        return $this->respond($res, [
          'channel' => $channel->getDetails()
        ]);
      } else {
        return $this->respond($res, [
          'error' => [
            'msg' => 'Empty File Uploaded'
          ]
        ], 500);
      }
    } catch (\ActiveRecord\RecordNotFound $e) {
      return $this->respond($res, [
        'error' => [
          'msg' => 'Channel Not Found'
        ]
      ], 404);
    }
  }

  function processChannelsArray($processedList, $currentChannel){
    array_push($processedList, $currentChannel->getDetails());
    return $processedList;
  }

}

 ?>
