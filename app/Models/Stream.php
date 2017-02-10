<?php
  namespace SlimRest\Models;

  class Stream extends \SlimRest\Model{
    static $belongs_to = [
      ['server']
    ];

    public function getDetails(){
      $stream = $this;
      $streamData = [
        "id" => $stream->id,
        "title" => $stream->title,
        "status" => $stream->status,
        "stream_url" => $stream->remote_url
      ];
      if(!is_null($stream->server_id)){
        $streamData['server'] = $stream->server->to_array();
        $streamData['server_channel'] = $stream->server_channel;
      }
      return $streamData;
    }

  }
 ?>
