<?php
namespace SlimRest\Middleware;

  class PaginatableMiddleWare {
    private $page_size;

    public function __construct($page_size = 25) {
      $this->page_size = $page_size;
    }

    public function __invoke(\Slim\Http\Request $request, \Slim\Http\Response $response, callable $next) {
      $page      = ($request->getParam('page', 0) > 0) ? $request->getParam('page') : 1;
      $limit     = $this->page_size;
      $skip      = ($page - 1) * $limit;

      $request = $request->withAttributes([
        'paginate' => [
          'limit' => $limit,
          'skip' => $skip
        ]
      ]);
      $response = $next($request, $response);
      return $response;
    }
  }
