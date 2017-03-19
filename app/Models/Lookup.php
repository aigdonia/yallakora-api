<?php
  namespace SlimRest\Models;

  class Lookup extends \SlimRest\Model{
    static $before_save = ['addAdditionalMeta'];
    public $additional;
    public function addAdditionalMeta()
    {
      if( !empty($this->additional) ){
        $this->meta = json_encode($this->meta);
      }
    }
    static public function getLookupsOf($category){
      $lookups = self::find('all', ['conditions' => ['category = ?', $category]]);

      return array_reduce($lookups, function($result, $lookup){
        $res = [
          'id' => $lookup->id,
          'title' => $lookup->title,
        ];
        if($lookup->meta){
          $res['meta'] = json_decode($lookup->meta);
        }
        $result[] = $res;
        return $result;
      }, []);
    }
  }
 ?>
