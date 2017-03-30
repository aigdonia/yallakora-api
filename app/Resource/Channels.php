<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Channel as Channel;
use \SlimRest\Models\Stream as Stream;

class Channels extends Resource{

	public function routes(){
		$this->get('/channels', [$this, 'listAllChannels']);
    $this->get('/channels/{channel}', [$this, 'getSingleChannel']);
    $this->get('/channels/{channel}/streams', [$this, 'getSingleChannelStreams']);
    $this->post('/channels/{channel}/logo', [$this, 'updateChannelLogo']);
    $this->post('/channels/{channel}/seo', [$this, 'updateChannelSEO']);
    $this->post('/channel/{channel}/title', [$this, 'updateChannelTitle']);
    // $this->put('/channels/{channel}/logo', [$this, 'updateChannelLogo']);
    $this->post('/channels', [$this, 'createNewChannel']);
    // $this->delete('/channels/{channel}', [$this, 'deleteSingleChannel']);
    $this->post('/channels/{channel}/remove', [$this, 'deleteSingleChannel']);
    $this->patch('/channels/sort', [$this, 'sortChannels']);
	}

	public function listAllChannels($req, $res, $args){
    $channels = Channel::find('all', ['order'=>'sort asc']);
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

  public function getSingleChannelStreams($req, $res, $args){
    $channel = Channel::find($args['channel']);
    return $this->respond($res, [
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

  public function updateChannelSEO($req, $res, $args){
    $channel_id = $args['channel'];
    $seo_desc = $req->getParsedBody()['desc'];
    $seo_keywords = $req->getParsedBody()['keywords'];
    $seo_content = $req->getParsedBody()['content'];
    $seo_url = $req->getParsedBody()['url'];

    try {
      $channel = Channel::find($channel_id);
      $channel->seo_desc = $seo_desc;
      $channel->seo_keywords = $seo_keywords;
      $channel->seo_content = $seo_content;
      $channel->seo_url = $seo_url;
      if( $channel->save() )
        return $this->respond($res, ['success'=>true]);
      else {
        return $this->respond($res, ['error'=>'Unable to update SEO terms'],500);
      }

    } catch (\ActiveRecord\RecordNotFound $e) {
      return $this->respond($res, [
        'error' => [
          'msg' => 'Channel Not Found'
        ]
      ], 404);
    }
  }

  public function updateChannelTitle($req, $res, $args){
    $channelID = $args['channel'];
    $newTitle = $req->getParsedBody()['title'];
    try{
      $channel = Channel::find($channelID);
      $channel->name = $newTitle;
      if($channel->save()){
        return $this->respond($res, ['channel'=>$channel->getDetails(false)]);
      }
    } catch(\ActiveRecord\RecordNotFound $e){
      return $this->respond($res, ["error"=>'Channel Not Found'], 404);
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

  function sortChannels($req, $res, $args){
    $channelsOrder = $req->getParsedBody()['channels'];
    foreach($channelsOrder as $channelName => $channelOrder){
      $v = Channel::update_all([
        'set' => [ 'sort' => $channelOrder ],
        'conditions' => ['id' => $channelName ]
      ]);
    }
    return $this->respond($res, $channelsOrder);
  }
}

 ?>
