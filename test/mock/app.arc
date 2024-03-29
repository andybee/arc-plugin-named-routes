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
/any
  method any
  name f

@plugins
named-routes
  src ../..

@named-routes
testing
  foo http://localhost:3333/foo/:id
staging
  foo https://staging.mydomain.com/foo/:id
production
  foo https://staging.mydomain.com/foo/:id
