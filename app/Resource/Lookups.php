<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Lookup as Lookup;

class Lookups extends Resource{
  public function routes(){
    $this->get('/lookups/{category}', [$this, 'getCategoryLookups']);
  }

  public function getCategoryLookups($req, $res, $args){
    $category = $args['category'];

    $categoryList = Lookup::getLookupsOf($category);

    return $this->respond($res, [
      $category => $categoryList
    ]);
  }
}
?>
