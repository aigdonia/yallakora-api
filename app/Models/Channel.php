<?php
  namespace SlimRest\Models;

  class Channel extends \SlimRest\Model{
    static $after_construct = [];
    static $before_validation = [];

    static $has_many = [
      ['streams']
    ];

    public function getDetails(){
      $attributes = [
        "name" => $this->id,
        "title" => $this->name,
      ];
      if(!empty($this->logo))
        $attributes['logo'] = $this->logo;

      return $attributes;
    }

    public function getStreams($filter = 'active'){
      $filteredStreams = $this->streams;

      if($filter !== 'all') {
        $filteredStreams = array_filter($filteredStreams, function($stream){
          return $stream->status == $filter;
        });
      }

      $filteredStreams = array_reduce($filteredStreams, function($formattedStreams, $stream){
        array_push($formattedStreams, $stream->getDetails());
        return $formattedStreams;
      }, []);

      return $filteredStreams;

    }
  }
 ?>
