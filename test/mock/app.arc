@app
named-routes-mock

@http
get / # tests that a route without any meta doesn't break the plugin
/a
  method get
  name a
/a
  method post
  name a # same name as /a but different method
/b/:id
  method get
  name b
/c/:id
  method put
  name b # same name as /b/:id but different path
/multi
  method get
  name c d e
/unnamed
  method get
/unnamed
  method post

@plugins
named-routes
  src ../..
