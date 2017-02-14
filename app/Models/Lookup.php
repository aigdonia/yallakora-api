<?php
  namespace SlimRest\Models;

  class Lookup extends \SlimRest\Model{
    static public function getLookupsOf($category){
      $lookups = self::find('all', ['conditions' => ['category = ?', $category]]);

      return array_reduce($lookups, function($result, $lookup){
        $result[] = [
          'id' => $lookup->id,
          'title' => $lookup->title
        ];
        return $result;
      }, []);
    }
  }
 ?>
