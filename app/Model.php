<?php
  namespace SlimRest;

  class Model extends \ActiveRecord\Model {

    public static function convertArray(array $objectsArr, $cb = null) {
      return array_map( function($obj){
          return $obj->to_array();
        } , $objectsArr
      );
    }
  }
?>
