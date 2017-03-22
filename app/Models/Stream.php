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
        "quality" => $stream->quality,
        "status" => $stream->status,
        "stream_url" => $stream->remote_url,
        "tag" => $stream->tag
      ];
      if(!is_null($stream->server_id)){
        $streamData['server'] = $stream->server->to_array();
        $streamData['server_channel'] = $stream->server_channel;
        // $streamData['stream_url'] = str_replace();
      }
      return $streamData;
    }

  }
 ?>
