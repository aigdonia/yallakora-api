<?php
namespace SlimRest\Resource;

use \SlimRest\Resource as Resource;
use \SlimRest\Models\Lookup as Lookup;

class Lookups extends Resource{
  public function routes(){
    $this->get('/lookups/{category}', [$this, 'getCategoryLookups']);
    $this->post('/lookups/{category}', [$this, 'createNewLookup']);
    $this->post('/lookups/{id}/remove', [$this, 'deleteLookup']);
  }

  public function getCategoryLookups($req, $res, $args){
    $category = $args['category'];

    $categoryList = Lookup::getLookupsOf($category);

    return $this->respond($res, [
      'lookups' => $categoryList
    ]);
  }

  public function createNewLookup($req, $res, $args){
    $category = $args['category'];
    $title = $req->getParsedBody()['title'];
    $data = $req->getParsedBody()['meta'];

    $lookup = new Lookup();
    $lookup->title = $title;
    $lookup->meta = json_encode($data);
    $lookup->category = $category;

    if( $lookup->save() )
      return $this->respond($res, [
        'lookup' => $lookup->attributes()
      ]);
  }

  public function deleteLookup($req, $res, $args){
    $lookupID = $args['id'];
    try {
      $lookup = Lookup::find($lookupID);

      $lookup->delete();
      return $this->respond($res, [
        'lookup' => $lookup->attributes()
      ]);
    } catch(\ActiveRecord\RecordNotFound $e){
      return $this->respond($res, [
        'msg' => 'Lookup Not found'
      ], 404);
    }

  }
}
?>
