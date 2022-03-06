@app
named-routes-mock

@http
get / # tests that a route without any meta doesn't break the plugin
/a
  method get
  name a
/b/:id
  method get
  name b

@plugins
named-routes
  src ../..
