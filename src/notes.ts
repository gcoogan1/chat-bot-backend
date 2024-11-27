/**
 * NOTES:
 * 
 * Static route: a normal route ("/hello")
 * Dynamic route: a route where data is passed in the url as a parameter ("/user/:id")
 * 
 * GET - retrive/get data from backend or database
 * PUT - update/modify data
 * POST - sent/create data
 * DELETE - delete data
 * 
 * app.use - adds express middleware
 * 
 * controllers: functions that handle requests in route
 * models: database schemas
 * 
 * middlewares: functions that are executed BEFORE a request is processed. In Node
 * and Express, middleware can be used to check JSON Body Validations, Tokens, or
 * Cookies Validations, Params Validations and more. It acts as a bridge between the 
 * request and response.
 * 
 * JWT - converts payload into a token
 * 
 * HTTP Only Cookies - special web cookies that restrict cookies from being accessed by 
 * javascript in the web-browser.
 * 
 * cors - setup to allow local frontend (http://localhost:5173/) url to access the backend
 * server (http://localhost:5000/). The credentials are true because we are setting http cookies
 * for authentication.
 */